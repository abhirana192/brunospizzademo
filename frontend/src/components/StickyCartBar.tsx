import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CartDrawer } from "./CartDrawer";

const HIDDEN_ON = ["/checkout", "/admin"];

export function StickyCartBar() {
  const { lines, itemCount, subtotal } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);

  const hidden = pathname === "/" || HIDDEN_ON.some((p) => pathname.startsWith(p)) || pathname.startsWith("/order/");
  if (lines.length === 0 || hidden) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 animate-fadeUp">
        <button
          onClick={() => setCartOpen(true)}
          className="w-full bg-charcoal-900 text-cream-50 shadow-pop border-t-2 border-amber-400 flex items-center justify-between gap-3 px-5 py-3.5 sm:px-8 hover:bg-charcoal-800 transition-colors"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-charcoal-900 text-xs font-bold">
              {itemCount}
            </span>
            View Cart
          </span>
          <span className="flex items-center gap-2 font-display font-bold text-lg">
            ${subtotal.toFixed(2)}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {/* Prevent content from hiding behind the bar */}
      <div className="h-16" aria-hidden />
    </>
  );
}
