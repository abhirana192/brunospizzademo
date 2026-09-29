import { RESTAURANT } from "../../constants";

export function LocationHours() {
  return (
    <section className="bg-charcoal-950 py-16 sm:py-20">
      <div className="section grid md:grid-cols-2 gap-6">
        <div className="rounded-xl2 bg-white/10 backdrop-blur-xl border border-white/15 shadow-premium p-6 sm:p-8">
          <span className="text-amber-400 font-semibold tracking-widest text-xs uppercase">Visit Us</span>
          <h2 className="font-display text-3xl font-bold text-cream-50 mt-1">Location &amp; Contact</h2>
          <div className="mt-6 space-y-3 text-white/75">
            <p className="flex gap-3"><span aria-hidden>📍</span> {RESTAURANT.address}</p>
            <p className="flex gap-3"><span aria-hidden>📞</span> {RESTAURANT.phone}</p>
            <p className="flex gap-3"><span aria-hidden>✉️</span> {RESTAURANT.email}</p>
          </div>
          {/* Map placeholder until the real restaurant address is provided */}
          <div className="mt-6 h-48 rounded-xl2 bg-white/5 flex items-center justify-center text-white/40 text-sm border border-white/10">
            Map will appear here once the restaurant address is confirmed
          </div>
        </div>
        <div className="rounded-xl2 bg-white/10 backdrop-blur-xl border border-white/15 shadow-premium p-6 sm:p-8">
          <span className="text-amber-400 font-semibold tracking-widest text-xs uppercase">Hours</span>
          <h2 className="font-display text-3xl font-bold text-cream-50 mt-1">Opening Hours</h2>
          <div className="mt-6 space-y-3">
            {RESTAURANT.hours.map((h) => (
              <div key={h.days} className="flex justify-between border-b border-white/10 pb-3 text-white/75">
                <span>{h.days}</span>
                <span className="font-semibold text-cream-50">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
