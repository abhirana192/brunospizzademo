import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { NAV_LINKS } from "../constants";
import { useCart } from "../context/CartContext";
import { CartDrawer } from "./CartDrawer";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur border-b border-charcoal-100">
        <div className="section flex items-center justify-between h-18 py-3">
          <Link to="/" aria-label="Bruno's Deli & Pizza home">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-colors ${
                    isActive ? "text-burgundy-600" : "text-charcoal-700 hover:text-burgundy-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2.5 hover:bg-cream-300 transition"
              aria-label={`Open cart, ${itemCount} items`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="21" r="1.4" fill="currentColor" />
                <circle cx="17" cy="21" r="1.4" fill="currentColor" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-burgundy-600 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <Link to="/menu" className="btn-primary hidden sm:inline-flex">
              Order Now
            </Link>

            <button
              className="md:hidden rounded-full p-2.5 hover:bg-cream-300"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-charcoal-100 bg-cream-100" aria-label="Mobile">
            <div className="section py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `py-3 text-base font-semibold border-b border-charcoal-50 ${isActive ? "text-burgundy-600" : "text-charcoal-800"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/menu" className="btn-primary mt-3 w-full" onClick={() => setMobileOpen(false)}>
                Order Now
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Mobile sticky order button */}
      <Link
        to="/menu"
        className="sm:hidden fixed bottom-4 left-4 right-4 z-30 btn-primary w-auto justify-center shadow-pop"
      >
        Order Now
      </Link>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
