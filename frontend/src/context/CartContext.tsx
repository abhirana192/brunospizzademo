import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { CartLine } from "../types";

const STORAGE_KEY = "bruno_pizza_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "cartLineId">) => void;
  updateLine: (cartLineId: string, updates: Partial<CartLine>) => void;
  removeLine: (cartLineId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addLine = (line: Omit<CartLine, "cartLineId">) => {
    const cartLineId = `${line.menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setLines((prev) => [...prev, { ...line, cartLineId }]);
  };

  const updateLine = (cartLineId: string, updates: Partial<CartLine>) => {
    setLines((prev) => prev.map((l) => (l.cartLineId === cartLineId ? { ...l, ...updates } : l)));
  };

  const removeLine = (cartLineId: string) => {
    setLines((prev) => prev.filter((l) => l.cartLineId !== cartLineId));
  };

  const clearCart = () => setLines([]);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const toppingsTotal = 0; // toppings already folded into unitPrice
        return sum + (l.unitPrice + toppingsTotal) * l.quantity;
      }, 0),
    [lines]
  );

  return (
    <CartContext.Provider value={{ lines, addLine, updateLine, removeLine, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
