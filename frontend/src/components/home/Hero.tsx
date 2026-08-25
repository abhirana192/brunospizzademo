import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-charcoal-900 min-h-[600px] flex items-center">
      <img
        src="/images/food/hero-pizza.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/85 to-charcoal-900/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-transparent to-transparent" />

      <div className="section relative py-20 sm:py-28">
        <div className="max-w-xl animate-fadeUp">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500 text-charcoal-900 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-charcoal-900 animate-pulse" />
            Open Late &middot; Til 3AM Most Nights
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-black text-cream-50 leading-[1.05]">
            HOT. FRESH. <span className="text-amber-400">BRUNO'S.</span>
          </h1>
          <p className="text-charcoal-100/80 text-lg mt-5 max-w-md">
            Handcrafted pizza, a full Chinese kitchen, and late-night diner favorites — made fresh and delivered city-wide.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/menu" className="btn-primary text-base py-3.5 px-7">
              Order Now
            </Link>
            <Link to="/menu" className="btn text-base py-3.5 px-7 bg-white/10 text-cream-50 hover:bg-white/20 backdrop-blur-sm">
              View Full Menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
