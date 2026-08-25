import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",

  databaseUrl: required("DATABASE_URL"),

  jwtSecret: required("JWT_SECRET", "dev_insecure_secret_change_me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",

  email: {
    host: process.env.EMAIL_HOST ?? "",
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER ?? "",
    password: process.env.EMAIL_PASSWORD ?? "",
    from: process.env.EMAIL_FROM ?? "Bruno Pizza <no-reply@brunopizza.com>",
    restaurantEmail: process.env.RESTAURANT_EMAIL ?? "orders@brunopizza.com",
  },

  business: {
    deliveryFee: Number(process.env.DELIVERY_FEE ?? 4.99),
    freeDeliveryThreshold: Number(process.env.FREE_DELIVERY_THRESHOLD ?? 35),
    // Bruno's is open late: Mon-Sat 10am-3am (next day), Sun 10am-1am (next day).
    // Close hours are expressed as hour-of-day + 24 to represent "next day".
    openHour: Number(process.env.OPEN_HOUR ?? 10),
    closeHourMonToSat: Number(process.env.CLOSE_HOUR_MON_TO_SAT ?? 27), // 3:00 AM
    closeHourSun: Number(process.env.CLOSE_HOUR_SUN ?? 25), // 1:00 AM
    // Pizza topping fees: standard toppings are charged per-size, premium
    // toppings (specialty meats) are a flat add-on regardless of size.
    pizzaToppingFeeSmall: Number(process.env.PIZZA_TOPPING_FEE_SMALL ?? 2.0),
    pizzaToppingFeeMedium: Number(process.env.PIZZA_TOPPING_FEE_MEDIUM ?? 2.0),
    pizzaToppingFeeLarge: Number(process.env.PIZZA_TOPPING_FEE_LARGE ?? 2.5),
    pizzaPremiumToppingFee: Number(process.env.PIZZA_PREMIUM_TOPPING_FEE ?? 7.0),
  },
};
