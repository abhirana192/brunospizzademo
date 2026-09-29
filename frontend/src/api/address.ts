import { api } from "./client";

export interface Address {
  id: string;
  label: string;
  address: string;
  apartment: string | null;
  city: string;
  postalCode: string;
  createdAt: string;
}

export interface AddressInput {
  label: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode: string;
}

export const addressApi = {
  list: () => api.get<{ addresses: Address[] }>("/customer/addresses"),
  create: (input: AddressInput) => api.post<{ address: Address }>("/customer/addresses", input),
  remove: (id: string) => api.delete<void>(`/customer/addresses/${encodeURIComponent(id)}`),
};
