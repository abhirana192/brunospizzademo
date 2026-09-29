import { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { RESTAURANT } from "../constants";
import { isPlainLeftClick, usePageTransition } from "../context/PageTransitionContext";

export function Footer() {
  const { navigateWithFade } = usePageTransition();

  function handleNavClick(e: MouseEvent, to: string) {
    if (!isPlainLeftClick(e)) return;
    e.preventDefault();
    navigateWithFade(to);
  }

  return (
    <footer className="bg-charcoal-950 text-charcoal-300 border-t border-white/10 pb-24 sm:pb-0">
      <div className="section py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <Logo className="[&_span]:text-cream-50 scale-90 origin-left sm:origin-center" />

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link to="/menu" className="hover:text-amber-400 transition-colors" onClick={(e) => handleNavClick(e, "/menu")}>
            Menu
          </Link>
          <Link to="/about" className="hover:text-amber-400 transition-colors" onClick={(e) => handleNavClick(e, "/about")}>
            About
          </Link>
          <Link to="/contact" className="hover:text-amber-400 transition-colors" onClick={(e) => handleNavClick(e, "/contact")}>
            Contact
          </Link>
          <a href={RESTAURANT.phoneHref} className="hover:text-amber-400 transition-colors">{RESTAURANT.phone}</a>
        </nav>

        <div className="flex gap-2.5">
          {["Instagram", "Facebook", "TikTok"].map((s) => (
            <a
              key={s}
              href="#"
              aria-label={s}
              className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold hover:bg-amber-500 hover:text-charcoal-900 transition"
            >
              {s[0]}
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section py-4 text-xs text-charcoal-400">
          <span>&copy; {new Date().getFullYear()} {RESTAURANT.name}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
