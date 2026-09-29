import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { CreateOrderInput } from "./orders.schema";
import { OrderItemCustomization, OrderItemWithCustomization } from "./orders.types";
import { sendCustomerConfirmationEmail, sendRestaurantNewOrderEmail } from "../email/emailService";

const CRUST_OPTIONS = ["Regular", "Thin Crust", "Thick Crust", "Stuffed Crust"];

// customization is stored as a JSON string (SQLite has no native Json type) -
// every read path parses it back into an object before the order is used or
// returned, so callers (email templates, API responses) never see the raw
// string. The explicit return type forces TS to fully override `items`
// rather than intersecting it with the generic input type.
function withParsedItems<T extends { items: { customization: string | null }[] }>(
  order: T
): Omit<T, "items"> & { items: OrderItemWithCustomization[] } {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      customization: item.customization ? (JSON.parse(item.customization) as OrderItemCustomization) : null,
    })),
  } as unknown as Omit<T, "items"> & { items: OrderItemWithCustomization[] };
}

function validateRequestedTime(isAsap: boolean, requestedTime?: string) {
  if (isAsap) return new Date();

  const dt = new Date(requestedTime!);
  if (Number.isNaN(dt.getTime())) {
    throw new ApiError(400, "The requested time is not valid.");
  }
  const now = new Date();
  const minLead = new Date(now.getTime() + 20 * 60 * 1000);
  if (dt < minLead) {
    throw new ApiError(400, "Scheduled time must be at least 20 minutes from now.");
  }
  const maxAdvance = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  if (dt > maxAdvance) {
    throw new ApiError(400, "Scheduled time can be at most 14 days in advance.");
  }

  // Hours wrap past midnight and vary by day (Mon-Sat close at 3am the next
  // day, Sun closes at 1am the next day), so a request in the early morning
  // hours belongs to the *previous* calendar day's business window.
  const closeHourForDay = (dayOfWeek: number) =>
    dayOfWeek === 0 ? env.business.closeHourSun : env.business.closeHourMonToSat;
  const hour = dt.getHours() + dt.getMinutes() / 60;
  const yesterday = (dt.getDay() + 6) % 7;
  const overnightCutoff = closeHourForDay(yesterday) - 24;
  const isOpen = hour >= env.business.openHour || hour < overnightCutoff;
  if (!isOpen) {
    throw new ApiError(400, "Please choose a time during our opening hours (10am - late night).");
  }
  return dt;
}

function toppingFeeForSize(sizeName: string): number {
  const normalized = sizeName.toLowerCase();
  if (normalized.includes("large")) return env.business.pizzaToppingFeeLarge;
  if (normalized.includes("medium")) return env.business.pizzaToppingFeeMedium;
  return env.business.pizzaToppingFeeSmall;
}

export async function createOrder(input: CreateOrderInput, customerId: string) {
  const requestedTime = validateRequestedTime(input.isAsap, input.requestedTime);

  // Re-fetch everything needed to price the order server-side. Never trust
  // prices sent from the client.
  const menuItemIds = [...new Set(input.items.map((i) => i.menuItemId))];
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: { sizes: true },
  });
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const toppingIds = [...new Set(input.items.flatMap((i) => i.toppingIds ?? []))];
  const toppings = await prisma.topping.findMany({ where: { id: { in: toppingIds } } });
  const toppingMap = new Map(toppings.map((t) => [t.id, t]));

  let subtotal = new Prisma.Decimal(0);
  const preparedItems: {
    menuItemId: string;
    nameSnapshot: string;
    quantity: number;
    size: string | null;
    basePrice: Prisma.Decimal;
    customization: OrderItemCustomization;
    price: Prisma.Decimal;
  }[] = [];

  for (const line of input.items) {
    const menuItem = menuItemMap.get(line.menuItemId);
    if (!menuItem || !menuItem.active) {
      throw new ApiError(409, `Sorry, "${menuItem?.name ?? "an item in your cart"}" is currently unavailable. Please remove it from your cart.`);
    }

    let size = menuItem.sizes[0] ?? null;
    if (line.sizeId) {
      const match = menuItem.sizes.find((s) => s.id === line.sizeId);
      if (!match) throw new ApiError(400, `Invalid size selected for ${menuItem.name}.`);
      size = match;
    }
    if (!size) {
      throw new ApiError(409, `Sorry, ${menuItem.name} has no available sizes right now.`);
    }

    let unitPrice = new Prisma.Decimal(size.price);
    const selectedToppings: { name: string; price: number }[] = [];

    if (menuItem.isPizza) {
      const crust = line.crust && CRUST_OPTIONS.includes(line.crust) ? line.crust : "Regular";
      const standardFee = toppingFeeForSize(size.name);
      for (const tId of line.toppingIds ?? []) {
        const topping = toppingMap.get(tId);
        if (!topping || !topping.active) {
          throw new ApiError(409, `Sorry, one of the selected toppings is currently unavailable. Please review your pizza.`);
        }
        const fee = topping.premium ? env.business.pizzaPremiumToppingFee : standardFee;
        unitPrice = unitPrice.plus(fee);
        selectedToppings.push({ name: topping.name, price: fee });
      }
      const lineTotal = unitPrice.times(line.quantity);
      subtotal = subtotal.plus(lineTotal);
      preparedItems.push({
        menuItemId: menuItem.id,
        nameSnapshot: menuItem.name,
        quantity: line.quantity,
        size: size.name,
        basePrice: size.price,
        customization: { crust, toppings: selectedToppings, specialInstructions: line.specialInstructions },
        price: lineTotal,
      });
    } else {
      const lineTotal = unitPrice.times(line.quantity);
      subtotal = subtotal.plus(lineTotal);
      preparedItems.push({
        menuItemId: menuItem.id,
        nameSnapshot: menuItem.name,
        quantity: line.quantity,
        size: size.name,
        basePrice: size.price,
        customization: { specialInstructions: line.specialInstructions },
        price: lineTotal,
      });
    }
  }

  const deliveryFee =
    input.orderType === "DELIVERY" && subtotal.lessThan(env.business.freeDeliveryThreshold)
      ? new Prisma.Decimal(env.business.deliveryFee)
      : new Prisma.Decimal(0);
  const total = subtotal.plus(deliveryFee);

  const order = await prisma.$transaction(async (tx) => {
    // Resolve the delivery address before creating the order: either use an
    // already-saved address (ownership-checked) or persist a brand-new one
    // in the same transaction, so "add a new address at checkout" both
    // saves it to the account and uses it for this order atomically.
    let addressId: string | null = null;
    let addressSnapshot: { address: string | null; apartment: string | null; city: string | null; postalCode: string | null } = {
      address: null,
      apartment: null,
      city: null,
      postalCode: null,
    };

    if (input.orderType === "DELIVERY") {
      if (input.newAddress) {
        const addr = await tx.address.create({
          data: {
            customerId,
            label: input.newAddress.label,
            address: input.newAddress.address,
            apartment: input.newAddress.apartment || null,
            city: input.newAddress.city,
            postalCode: input.newAddress.postalCode,
          },
        });
        addressId = addr.id;
        addressSnapshot = { address: addr.address, apartment: addr.apartment, city: addr.city, postalCode: addr.postalCode };
      } else if (input.addressId) {
        const addr = await tx.address.findFirst({ where: { id: input.addressId, customerId } });
        if (!addr) throw new ApiError(404, "Selected address not found.");
        addressId = addr.id;
        addressSnapshot = { address: addr.address, apartment: addr.apartment, city: addr.city, postalCode: addr.postalCode };
      }
    }

    const counter = await tx.ticketCounter.update({ where: { id: 1 }, data: { value: { increment: 1 } } });
    const ticketNumber = `BP-${counter.value}`;

    return tx.order.create({
      data: {
        ticketNumber,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || null,
        orderType: input.orderType,
        customerId,
        addressId,
        ...addressSnapshot,
        deliveryNotes: input.deliveryNotes || null,
        isAsap: input.isAsap,
        requestedTime,
        subtotal,
        deliveryFee,
        total,
        notes: input.notes || null,
        status: "NEW",
        items: {
          create: preparedItems.map((i) => ({
            menuItemId: i.menuItemId,
            nameSnapshot: i.nameSnapshot,
            quantity: i.quantity,
            size: i.size,
            basePrice: i.basePrice,
            customization: JSON.stringify(i.customization),
            price: i.price,
          })),
        },
      },
      include: { items: true },
    });
  });

  const parsedOrder = withParsedItems(order);

  // Best-effort notifications: never roll back the order if email fails.
  const [customerSent, restaurantSent] = await Promise.all([
    sendCustomerConfirmationEmail(parsedOrder),
    sendRestaurantNewOrderEmail(parsedOrder),
  ]);
  await prisma.order.update({
    where: { id: order.id },
    data: {
      customerEmailSentAt: customerSent ? new Date() : undefined,
      restaurantEmailSentAt: restaurantSent ? new Date() : undefined,
    },
  });

  return parsedOrder;
}

export async function getOrderByTicket(ticketNumber: string) {
  const order = await prisma.order.findUnique({
    where: { ticketNumber: ticketNumber.toUpperCase() },
    include: { items: true },
  });
  if (!order) throw new ApiError(404, "We couldn't find an order with that ticket number.");
  return withParsedItems(order);
}

export async function listOrdersForCustomer(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(withParsedItems);
}

export interface AdminOrderSearch {
  ticketNumber?: string;
  q?: string;
  date?: string;
  status?: string;
}

const VALID_STATUSES = ["NEW", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

export async function searchOrders(params: AdminOrderSearch) {
  const where: Prisma.OrderWhereInput = {};

  if (params.ticketNumber) {
    // SQLite's LIKE (which `contains` compiles to) is already
    // case-insensitive for ASCII by default - no `mode` option needed
    // (and unlike Postgres, SQLite's Prisma connector doesn't support one).
    where.ticketNumber = { contains: params.ticketNumber };
  }
  if (params.q) {
    where.OR = [{ customerName: { contains: params.q } }, { phone: { contains: params.q } }];
  }
  if (params.status && VALID_STATUSES.includes(params.status)) {
    where.status = params.status;
  }
  if (params.date) {
    const start = new Date(params.date);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.createdAt = { gte: start, lt: end };
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return orders.map(withParsedItems);
}

export async function updateOrderStatus(orderId: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, "Order not found.");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true },
  });
  return withParsedItems(updated);
}
