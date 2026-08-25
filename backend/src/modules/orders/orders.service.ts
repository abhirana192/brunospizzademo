import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { CreateOrderInput } from "./orders.schema";
import { OrderItemCustomization } from "./orders.types";
import { sendCustomerConfirmationEmail, sendRestaurantNewOrderEmail } from "../email/emailService";

const CRUST_OPTIONS = ["Regular", "Thin Crust", "Thick Crust", "Stuffed Crust"];

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

export async function createOrder(input: CreateOrderInput) {
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
    const seq = await tx.$queryRawUnsafe<{ nextval: bigint }[]>(`SELECT nextval('ticket_number_seq')`);
    const ticketNumber = `BP-${seq[0].nextval.toString()}`;

    return tx.order.create({
      data: {
        ticketNumber,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || null,
        orderType: input.orderType,
        address: input.address || null,
        apartment: input.apartment || null,
        city: input.city || null,
        postalCode: input.postalCode || null,
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
            customization: i.customization as Prisma.InputJsonValue,
            price: i.price,
          })),
        },
      },
      include: { items: true },
    });
  });

  // Best-effort notifications: never roll back the order if email fails.
  const [customerSent, restaurantSent] = await Promise.all([
    sendCustomerConfirmationEmail(order),
    sendRestaurantNewOrderEmail(order),
  ]);
  await prisma.order.update({
    where: { id: order.id },
    data: {
      customerEmailSentAt: customerSent ? new Date() : undefined,
      restaurantEmailSentAt: restaurantSent ? new Date() : undefined,
    },
  });

  return order;
}

export async function getOrderByTicket(ticketNumber: string) {
  const order = await prisma.order.findUnique({
    where: { ticketNumber: ticketNumber.toUpperCase() },
    include: { items: true },
  });
  if (!order) throw new ApiError(404, "We couldn't find an order with that ticket number.");
  return order;
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
    where.ticketNumber = { contains: params.ticketNumber, mode: "insensitive" };
  }
  if (params.q) {
    where.OR = [
      { customerName: { contains: params.q, mode: "insensitive" } },
      { phone: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.status && VALID_STATUSES.includes(params.status)) {
    where.status = params.status as Prisma.EnumOrderStatusFilter["equals"];
  }
  if (params.date) {
    const start = new Date(params.date);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.createdAt = { gte: start, lt: end };
    }
  }

  return prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, "Order not found.");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as Prisma.OrderUpdateInput["status"] },
    include: { items: true },
  });
}
