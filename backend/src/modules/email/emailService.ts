import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";
import { OrderWithItems } from "../orders/orders.types";
import { customerConfirmationTemplate, restaurantNewOrderTemplate } from "./templates";

let transporter: Transporter | null = null;
let usingConsoleFallback = false;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (!env.email.host) {
    usingConsoleFallback = true;
    // No SMTP configured (typical for local dev): log full email content to
    // the console instead of failing so order flows can still be verified.
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: env.email.user ? { user: env.email.user, pass: env.email.password } : undefined,
  });
  return transporter;
}

async function send(to: string, subject: string, html: string, label: string) {
  try {
    const info = await getTransporter().sendMail({
      from: env.email.from,
      to,
      subject,
      html,
    });
    if (usingConsoleFallback) {
      console.log(`\n===== [EMAIL:${label}] (SMTP not configured — logged instead of sent) =====`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(JSON.parse((info as any).message).html ?? html);
      console.log(`===== end ${label} =====\n`);
    } else {
      console.log(`[EMAIL:${label}] sent to ${to} (messageId=${info.messageId})`);
    }
    return true;
  } catch (err) {
    // Order must never be lost because of an email failure - log for retry.
    console.error(`[EMAIL:${label}] FAILED to send to ${to}:`, err);
    return false;
  }
}

export async function sendCustomerConfirmationEmail(order: OrderWithItems): Promise<boolean> {
  if (!order.email) return false;
  const { subject, html } = customerConfirmationTemplate(order);
  return send(order.email, subject, html, "CUSTOMER_CONFIRMATION");
}

export async function sendRestaurantNewOrderEmail(order: OrderWithItems): Promise<boolean> {
  const { subject, html } = restaurantNewOrderTemplate(order);
  return send(env.email.restaurantEmail, subject, html, "RESTAURANT_NEW_ORDER");
}
