import { api } from "./client";
import { Category, Deal, MenuItem, OrderDTO, OrderStatus, Topping } from "../types";

export interface AdminUser {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
}

export const adminAuthApi = {
  login: (email: string, password: string) => api.post<{ user: AdminUser }>("/admin/login", { email, password }),
  logout: () => api.post<void>("/admin/logout"),
  me: () => api.get<{ user: AdminUser }>("/admin/me"),
};

export const adminOrdersApi = {
  search: (params: { ticketNumber?: string; q?: string; date?: string; status?: string }) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return api.get<{ orders: OrderDTO[] }>(`/admin/orders${qs ? `?${qs}` : ""}`);
  },
  updateStatus: (id: string, status: OrderStatus) => api.patch<{ order: OrderDTO }>(`/admin/orders/${id}/status`, { status }),
};

export interface MenuItemInput {
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  active?: boolean;
  isPizza?: boolean;
  featured?: boolean;
  sortOrder?: number;
  sizes: { id?: string; name: string; price: number; sortOrder?: number }[];
}

type WithNumberPrice<T> = Partial<Omit<T, "price">> & { price?: number };

export const adminMenuApi = {
  listCategories: () => api.get<{ categories: Category[] }>("/admin/menu/categories"),
  createCategory: (input: Partial<Category>) => api.post<{ category: Category }>("/admin/menu/categories", input),
  updateCategory: (id: string, input: Partial<Category>) => api.put<{ category: Category }>(`/admin/menu/categories/${id}`, input),
  deleteCategory: (id: string) => api.delete<void>(`/admin/menu/categories/${id}`),

  listItems: () => api.get<{ items: MenuItem[] }>("/admin/menu/items"),
  createItem: (input: MenuItemInput) => api.post<{ item: MenuItem }>("/admin/menu/items", input),
  updateItem: (id: string, input: MenuItemInput) => api.put<{ item: MenuItem }>(`/admin/menu/items/${id}`, input),
  deleteItem: (id: string) => api.delete<void>(`/admin/menu/items/${id}`),

  listToppings: () => api.get<{ toppings: Topping[] }>("/admin/menu/toppings"),
  createTopping: (input: WithNumberPrice<Topping>) => api.post<{ topping: Topping }>("/admin/menu/toppings", input),
  updateTopping: (id: string, input: WithNumberPrice<Topping>) => api.put<{ topping: Topping }>(`/admin/menu/toppings/${id}`, input),
  deleteTopping: (id: string) => api.delete<void>(`/admin/menu/toppings/${id}`),

  listDeals: () => api.get<{ deals: Deal[] }>("/admin/menu/deals"),
  createDeal: (input: WithNumberPrice<Deal>) => api.post<{ deal: Deal }>("/admin/menu/deals", input),
  updateDeal: (id: string, input: WithNumberPrice<Deal>) => api.put<{ deal: Deal }>(`/admin/menu/deals/${id}`, input),
  deleteDeal: (id: string) => api.delete<void>(`/admin/menu/deals/${id}`),
};
