import { MouseEvent, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { NAV_LINKS } from "../constants";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useToast } from "../context/ToastContext";
import { isPlainLeftClick, usePageTransition } from "../context/PageTransitionContext";
import { CartDrawer } from "./CartDrawer";
import { AuthModal } from "./AuthModal";

// Home is a persistent, fixed single-screen video shell (see CinematicShell)
// that never scrolls, so the header floats transparently over it - no
// scroll-triggered color swap needed there.
const HERO_PAGES = ["/"];

// These pages use the same dark-glass theme as Home (bg-charcoal-950, glass
// cards) rather than the site's light/cream theme, so the header gets the
// same transparent, white-text treatment here too - just sticky instead of
// absolute, since (unlike Home) these are normal pages that actually scroll.
const DARK_PAGES = ["/menu", "/about", "/contact", "/account"];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { customer, logout } = useCustomerAuth();
  const { showToast } = useToast();
  const { pathname } = useLocation();
  const { navigateWithFade } = usePageTransition();
  const hasHero = HERO_PAGES.includes(pathname);
  const isDarkPage = hasHero || DARK_PAGES.includes(pathname);
  const transparent = isDarkPage;

  async function handleLogout() {
    await logout();
    setAccountMenuOpen(false);
    showToast("Signed out.");
  }

  function handleNavClick(e: MouseEvent, to: string) {
    if (!isPlainLeftClick(e)) return;
    e.preventDefault();
    navigateWithFade(to);
  }

  const firstName = customer?.firstName;

  return (
    <>
      <header
        className={
          hasHero
            ? "absolute top-0 left-0 right-0 z-40 bg-transparent"
            : isDarkPage
            ? "sticky top-0 z-40 bg-charcoal-950/70 backdrop-blur-md"
            : "sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md"
        }
      >
        <div className="section relative flex items-center justify-between h-20 py-3">
          <Link to="/" aria-label="Bruno's Deli & Pizza home" onClick={(e) => handleNavClick(e, "/")}>
            <Logo className={transparent ? "[&_span]:text-white" : ""} />
          </Link>

          <nav
            className={`hidden md:flex absolute left-1/2 top-1/2 translate-x-[calc(-50%+2rem)] -translate-y-1/2 items-center gap-1 rounded-full px-2 py-1.5 transition-colors duration-300 ${
              transparent ? "bg-white/10 backdrop-blur-md border border-white/20" : "bg-white shadow-sm"
            }`}
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-colors rounded-full px-4 py-2 ${
                    isActive
                      ? "bg-burgundy-600 text-white"
                      : transparent
                      ? "text-white/85 hover:text-white"
                      : "text-charcoal-600 hover:text-burgundy-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className={`flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ${
                    transparent
                      ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                      : "bg-white shadow-sm hover:shadow-card text-charcoal-800"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={accountMenuOpen}
                >
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      transparent ? "bg-white/20 text-white" : "bg-burgundy-600 text-white"
                    }`}
                    aria-hidden
                  >
                    {firstName?.[0]?.toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{firstName}</span>
                </button>

                {accountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAccountMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-20 w-44 rounded-xl bg-white shadow-pop border border-cream-200 py-1.5 animate-fadeUp">
                      <p className="px-4 py-2 text-xs text-charcoal-400 truncate">{customer.email}</p>
                      <Link
                        to="/account"
                        onClick={(e) => {
                          setAccountMenuOpen(false);
                          handleNavClick(e, "/account");
                        }}
                        className="block px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-cream-100"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-cream-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                  transparent
                    ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                    : "bg-white shadow-sm hover:shadow-card text-charcoal-800"
                }`}
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className={`relative rounded-full p-2.5 transition-colors duration-300 ${
                transparent
                  ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                  : "bg-white shadow-sm hover:shadow-card"
              }`}
              aria-label={`Open cart, ${itemCount} items`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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

            <Link to="/menu" className="btn-primary hidden sm:inline-flex" onClick={(e) => handleNavClick(e, "/menu")}>
              Order Now
            </Link>

            <button
              className={`md:hidden rounded-full p-2.5 transition-colors duration-300 ${
                transparent ? "bg-white/10 backdrop-blur-md border border-white/20 text-white" : "bg-white shadow-sm"
              }`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
                  onClick={(e) => {
                    setMobileOpen(false);
                    handleNavClick(e, link.to);
                  }}
                  className={({ isActive }) =>
                    `py-3 text-base font-semibold border-b border-charcoal-50 ${isActive ? "text-burgundy-600" : "text-charcoal-800"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/menu"
                className="btn-primary mt-3 w-full"
                onClick={(e) => {
                  setMobileOpen(false);
                  handleNavClick(e, "/menu");
                }}
              >
                Order Now
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Mobile sticky order button - hidden once the cart bar takes over, and on
          the menu itself since you're already there. */}
      {itemCount === 0 && pathname !== "/menu" && (
        <Link
          to="/menu"
          className="sm:hidden fixed bottom-4 left-4 right-4 z-30 btn-primary w-auto justify-center shadow-pop"
          onClick={(e) => handleNavClick(e, "/menu")}
        >
          Order Now
        </Link>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
