import { api } from "./client";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export const customerAuthApi = {
  signup: (input: { firstName: string; lastName: string; email: string; password: string; phone: string }) =>
    api.post<{ user: Customer }>("/customer/signup", input),
  login: (email: string, password: string) => api.post<{ user: Customer }>("/customer/login", { email, password }),
  logout: () => api.post<void>("/customer/logout"),
  me: () => api.get<{ user: Customer }>("/customer/me"),
  updateProfile: (input: { firstName: string; lastName: string; phone: string }) =>
    api.patch<{ user: Customer }>("/customer/me", input),
};
