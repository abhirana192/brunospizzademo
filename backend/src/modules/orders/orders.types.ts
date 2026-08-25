import { Order, OrderItem } from "@prisma/client";

export type OrderWithItems = Order & { items: OrderItem[] };

export interface ToppingSelection {
  name: string;
  price: number;
}

export interface OrderItemCustomization {
  crust?: string;
  toppings?: ToppingSelection[];
  specialInstructions?: string;
}
