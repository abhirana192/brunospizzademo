const REASONS = [
  {
    n: "01",
    title: "Open Late, Every Night",
    text: "Mon-Sat til 3AM, Sunday til 1AM. When the craving hits after midnight, we're still firing the oven.",
  },
  {
    n: "02",
    title: "One Menu, No Compromises",
    text: "Handcrafted pizza, a full Chinese kitchen, and diner classics — order it all in one cart, one delivery.",
  },
  {
    n: "03",
    title: "Fast, City-Wide Delivery",
    text: "Quick pickup windows and dependable delivery, with live status updates from kitchen to door.",
  },
  {
    n: "04",
    title: "Pay When It Arrives",
    text: "No online payment required — settle up simply and safely at pickup or delivery, every time.",
  },
];

export function WhyBruno() {
  return (
    <section className="bg-charcoal-950 section py-16 sm:py-20">
      <div className="max-w-xl mb-12">
        <span className="text-amber-400 font-semibold tracking-widest text-xs uppercase">Why Bruno's</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-50 mt-1">Made the Bruno's Way</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REASONS.map((r) => (
          <div
            key={r.n}
            className="flex gap-5 p-6 rounded-xl2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200"
          >
            <span className="font-display text-5xl font-black text-amber-400/25 leading-none select-none shrink-0">{r.n}</span>
            <div>
              <h3 className="font-display font-bold text-xl text-cream-50">{r.title}</h3>
              <p className="text-sm text-white/60 mt-2 leading-relaxed max-w-sm">{r.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
