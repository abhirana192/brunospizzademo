import { OrderWithItems, OrderItemCustomization } from "../orders/orders.types";

const money = (n: number | string | { toString(): string }) => `$${Number(n.toString()).toFixed(2)}`;

function formatTime(order: OrderWithItems): string {
  if (order.isAsap) return "As soon as possible";
  return new Date(order.requestedTime).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function itemLines(order: OrderWithItems): string {
  return order.items
    .map((item) => {
      const c = (item.customization ?? {}) as OrderItemCustomization;
      const details: string[] = [];
      if (item.size) details.push(item.size);
      if (c.crust) details.push(`${c.crust} crust`);
      if (c.toppings?.length) details.push(c.toppings.map((t) => t.name).join(", "));
      const detailLine = details.length
        ? `<ul style="margin:4px 0 0 0;padding-left:18px;color:#5b5b5b;font-size:13px;">${details
            .map((d) => `<li>${d}</li>`)
            .join("")}</ul>`
        : "";
      const notes = c.specialInstructions
        ? `<div style="margin-top:2px;font-size:13px;color:#8a2b1c;font-style:italic;">Note: ${c.specialInstructions}</div>`
        : "";
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;vertical-align:top;">
          <strong>${item.quantity} × ${item.nameSnapshot}</strong>
          ${detailLine}
          ${notes}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;vertical-align:top;white-space:nowrap;">${money(
          item.price
        )}</td>
      </tr>`;
    })
    .join("");
}

function baseWrapper(headline: string, accent: string, body: string): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;background:#fdf8f3;padding:0;">
    <div style="background:${accent};padding:28px 24px;text-align:center;">
      <div style="color:#fdf8f3;font-size:13px;letter-spacing:3px;text-transform:uppercase;opacity:0.85;">Bruno Pizza</div>
      <div style="color:#fdf8f3;font-size:24px;font-weight:bold;margin-top:6px;">${headline}</div>
    </div>
    <div style="padding:24px;background:#ffffff;">${body}</div>
    <div style="padding:16px 24px;text-align:center;font-size:12px;color:#9a9a9a;">Bruno Pizza · Payment is handled at pickup or delivery, not online.</div>
  </div>`;
}

export function customerConfirmationTemplate(order: OrderWithItems) {
  const subject = `Bruno Pizza — Order Received (${order.ticketNumber})`;
  const addressBlock =
    order.orderType === "DELIVERY"
      ? `<p style="margin:4px 0;"><strong>Delivering to:</strong> ${order.address}${order.apartment ? `, ${order.apartment}` : ""}, ${order.city} ${order.postalCode}</p>`
      : `<p style="margin:4px 0;"><strong>Pickup at:</strong> Bruno Pizza</p>`;

  const body = `
    <p>Hi ${order.customerName}, thank you for ordering from Bruno Pizza! Your order has been successfully received.</p>
    <div style="text-align:center;margin:20px 0;">
      <div style="font-size:12px;letter-spacing:2px;color:#8a8a8a;text-transform:uppercase;">Your Ticket Number</div>
      <div style="font-size:32px;font-weight:bold;color:#7a1f13;">${order.ticketNumber}</div>
    </div>
    <p style="margin:4px 0;"><strong>Order type:</strong> ${order.orderType === "DELIVERY" ? "Delivery" : "Pickup"}</p>
    ${addressBlock}
    <p style="margin:4px 0;"><strong>Requested time:</strong> ${formatTime(order)}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">${itemLines(order)}</table>
    <table style="width:100%;margin-top:12px;font-size:14px;">
      <tr><td>Subtotal</td><td style="text-align:right;">${money(order.subtotal)}</td></tr>
      ${Number(order.deliveryFee) > 0 ? `<tr><td>Delivery fee</td><td style="text-align:right;">${money(order.deliveryFee)}</td></tr>` : ""}
      <tr style="font-weight:bold;font-size:16px;"><td style="padding-top:6px;">Total</td><td style="text-align:right;padding-top:6px;">${money(order.total)}</td></tr>
    </table>
    <p style="margin-top:20px;padding:12px;background:#fdf3ea;border-radius:8px;font-size:13px;">Your order has been successfully received by Bruno Pizza. Payment will be handled separately at pickup or delivery.</p>
    <p style="font-size:13px;color:#8a8a8a;">Please keep your ticket number for reference.</p>
  `;
  return { subject, html: baseWrapper("Your Order Has Been Received!", "#7a1f13", body) };
}

export function restaurantNewOrderTemplate(order: OrderWithItems) {
  const subject = `NEW ORDER — ${order.ticketNumber} (${order.orderType})`;
  const addressBlock =
    order.orderType === "DELIVERY"
      ? `<p style="margin:4px 0;"><strong>Deliver to:</strong> ${order.address}${order.apartment ? `, ${order.apartment}` : ""}, ${order.city} ${order.postalCode}</p>`
      : "";

  const body = `
    <div style="display:inline-block;background:#e6b800;color:#2a2a2a;font-weight:bold;padding:4px 10px;border-radius:4px;font-size:12px;letter-spacing:1px;">NEW ORDER</div>
    <p style="margin:10px 0 4px;"><strong>Ticket:</strong> ${order.ticketNumber}</p>
    <p style="margin:4px 0;"><strong>Customer:</strong> ${order.customerName}</p>
    <p style="margin:4px 0;"><strong>Phone:</strong> ${order.phone}</p>
    <p style="margin:4px 0;"><strong>Order type:</strong> ${order.orderType === "DELIVERY" ? "Delivery" : "Pickup"}</p>
    ${addressBlock}
    <p style="margin:4px 0;"><strong>Requested time:</strong> ${formatTime(order)}</p>
    <h3 style="margin-top:18px;border-bottom:2px solid #2a2a2a;padding-bottom:4px;">ORDER</h3>
    <table style="width:100%;border-collapse:collapse;">${itemLines(order)}</table>
    <table style="width:100%;margin-top:12px;font-size:14px;">
      <tr><td>Subtotal</td><td style="text-align:right;">${money(order.subtotal)}</td></tr>
      ${Number(order.deliveryFee) > 0 ? `<tr><td>Delivery fee</td><td style="text-align:right;">${money(order.deliveryFee)}</td></tr>` : ""}
      <tr style="font-weight:bold;font-size:18px;"><td style="padding-top:6px;">TOTAL</td><td style="text-align:right;padding-top:6px;">${money(order.total)}</td></tr>
    </table>
    ${order.notes ? `<p style="margin-top:16px;"><strong>Special Instructions:</strong><br/>${order.notes}</p>` : ""}
  `;
  return { subject, html: baseWrapper("New Bruno Pizza Order", "#2a2a2a", body) };
}
