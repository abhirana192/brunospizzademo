import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { OrderType } from "../types";

const STORAGE_KEY = "bruno_pizza_order_type_v1";

interface OrderTypeContextValue {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
}

const OrderTypeContext = createContext<OrderTypeContextValue | null>(null);

export function OrderTypeProvider({ children }: { children: ReactNode }) {
  const [orderType, setOrderType] = useState<OrderType>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "DELIVERY" ? "DELIVERY" : "PICKUP";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, orderType);
  }, [orderType]);

  return <OrderTypeContext.Provider value={{ orderType, setOrderType }}>{children}</OrderTypeContext.Provider>;
}

export function useOrderType() {
  const ctx = useContext(OrderTypeContext);
  if (!ctx) throw new Error("useOrderType must be used within OrderTypeProvider");
  return ctx;
}
