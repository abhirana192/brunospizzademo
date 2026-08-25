const ITEMS = [
  "🍕 Handcrafted Pizza",
  "🥡 Chinese Kitchen",
  "🍗 Wings 5 Ways",
  "🥪 Hot Sandwiches",
  "🍟 Poutine",
  "🥟 Dumplings",
  "🕐 Open Til 3AM",
  "🚗 Fast Delivery, City Wide",
];

export function MenuTicker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden bg-amber-500 border-y border-amber-400/40" aria-hidden>
      <div className="flex whitespace-nowrap animate-marquee py-2.5">
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 text-xs font-bold uppercase tracking-wider text-charcoal-900">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
