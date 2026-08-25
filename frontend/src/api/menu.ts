import { api } from "./client";
import { CategoryWithItems, Deal, PizzaToppingFees, Topping } from "../types";

export const menuApi = {
  getMenu: () => api.get<{ categories: CategoryWithItems[]; toppings: Topping[]; pizzaToppingFees: PizzaToppingFees }>("/menu"),
  getDeals: () => api.get<{ deals: Deal[] }>("/deals"),
};
