import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { menuApi } from "../api/menu";
import { CategoryWithItems, Deal, MenuItem, PizzaToppingFees, Topping } from "../types";

const DEFAULT_TOPPING_FEES: PizzaToppingFees = { small: 2, medium: 2, large: 2.5, premium: 7 };

interface MenuDataContextValue {
  categories: CategoryWithItems[];
  toppings: Topping[];
  deals: Deal[];
  pizzaToppingFees: PizzaToppingFees;
  loading: boolean;
  error: string | null;
  findMenuItem: (id: string) => MenuItem | undefined;
  refetch: () => void;
}

const MenuDataContext = createContext<MenuDataContextValue | null>(null);

export function MenuDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pizzaToppingFees, setPizzaToppingFees] = useState<PizzaToppingFees>(DEFAULT_TOPPING_FEES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([menuApi.getMenu(), menuApi.getDeals()])
      .then(([menuRes, dealsRes]) => {
        setCategories(menuRes.categories);
        setToppings(menuRes.toppings);
        setPizzaToppingFees(menuRes.pizzaToppingFees);
        setDeals(dealsRes.deals);
      })
      .catch(() => setError("We couldn't load the menu right now. Please refresh the page."))
      .finally(() => setLoading(false));
  }, [version]);

  const findMenuItem = (id: string) => categories.flatMap((c) => c.menuItems).find((m) => m.id === id);

  return (
    <MenuDataContext.Provider
      value={{ categories, toppings, deals, pizzaToppingFees, loading, error, findMenuItem, refetch: () => setVersion((v) => v + 1) }}
    >
      {children}
    </MenuDataContext.Provider>
  );
}

export function useMenuData() {
  const ctx = useContext(MenuDataContext);
  if (!ctx) throw new Error("useMenuData must be used within MenuDataProvider");
  return ctx;
}
