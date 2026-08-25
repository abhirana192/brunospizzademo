import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { RESTAURANT } from "../constants";

export function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-100 mt-24 pb-24 sm:pb-0">
      <div className="section grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 py-14">
        <div>
          <Logo className="[&_span]:text-cream-50" />
          <p className="mt-4 text-sm text-charcoal-300 leading-relaxed">
            Handcrafted pizza, Chinese food, and diner classics made fresh for every order. Order online, pay at pickup or delivery.
          </p>
          <div className="flex gap-3 mt-5">
            {["Instagram", "Facebook", "TikTok"].map((s) => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-amber-500 hover:text-charcoal-900 transition"
              >
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-charcoal-300">
            <li><Link to="/menu" className="hover:text-amber-400">Order Online</Link></li>
            <li><Link to="/menu" className="hover:text-amber-400">Menu</Link></li>
            <li><Link to="/deals" className="hover:text-amber-400">Deals</Link></li>
            <li><Link to="/about" className="hover:text-amber-400">About</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Contact</h4>
          <ul className="space-y-2.5 text-sm text-charcoal-300">
            <li><a href={RESTAURANT.phoneHref} className="hover:text-amber-400">{RESTAURANT.phone}</a></li>
            <li>{RESTAURANT.website}</li>
            <li>{RESTAURANT.address}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Opening Hours</h4>
          <ul className="space-y-2.5 text-sm text-charcoal-300">
            {RESTAURANT.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <span className="text-cream-100">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section py-5 text-xs text-charcoal-300 flex flex-col sm:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} {RESTAURANT.name}. All rights reserved.</span>
          <Link to="/admin/login" className="hover:text-amber-400">Staff Login</Link>
        </div>
      </div>
    </footer>
  );
}
