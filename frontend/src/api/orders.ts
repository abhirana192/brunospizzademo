import { api } from "./client";
import { OrderDTO, OrderType } from "../types";

export interface CreateOrderPayload {
  orderType: OrderType;
  customerName: string;
  phone: string;
  email?: string;
  addressId?: string;
  newAddress?: {
    label: string;
    address: string;
    apartment?: string;
    city: string;
    postalCode: string;
  };
  deliveryNotes?: string;
  isAsap: boolean;
  requestedTime?: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    sizeId: string;
    crust?: string;
    toppingIds: string[];
    specialInstructions?: string;
  }[];
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) => api.post<{ ticketNumber: string; order: OrderDTO }>("/orders", payload),
  getByTicket: (ticketNumber: string) => api.get<{ order: OrderDTO }>(`/orders/${encodeURIComponent(ticketNumber)}`),
  listMine: () => api.get<{ orders: OrderDTO[] }>("/customer/orders"),
};
