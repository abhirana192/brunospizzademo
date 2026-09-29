import { Order, OrderItem } from "@prisma/client";

export interface ToppingSelection {
  name: string;
  price: number;
}

export interface OrderItemCustomization {
  crust?: string;
  toppings?: ToppingSelection[];
  specialInstructions?: string;
}

// OrderItem.customization is stored as a JSON string (SQLite has no native
// Json type) - callers work with the parsed-back-to-object shape instead.
export type OrderItemWithCustomization = Omit<OrderItem, "customization"> & {
  customization: OrderItemCustomization | null;
};

export type OrderWithItems = Order & { items: OrderItemWithCustomization[] };
