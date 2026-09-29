const FREE_DELIVERY_THRESHOLD = 35;

export function FreeDeliveryProgress({ subtotal, transparent = false }: { subtotal: number; transparent?: boolean }) {
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const unlocked = remaining === 0;

  return (
    <div
      className={`rounded-xl2 p-3.5 transition-colors border ${
        transparent
          ? unlocked
            ? "bg-emerald-400/10 border-emerald-400/30"
            : "bg-amber-400/10 border-amber-400/30"
          : unlocked
          ? "bg-green-50 border-green-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span
          className={`font-semibold ${
            transparent ? (unlocked ? "text-emerald-300" : "text-white/85") : unlocked ? "text-green-700" : "text-charcoal-800"
          }`}
        >
          {unlocked ? "🎉 You've unlocked free delivery!" : `🚗 Add $${remaining.toFixed(2)} more for FREE delivery`}
        </span>
      </div>
      <div className={`h-2 rounded-full mt-2 overflow-hidden ${transparent ? "bg-white/10" : "bg-cream-200"}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            unlocked ? (transparent ? "bg-emerald-400" : "bg-green-500") : "bg-amber-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export { FREE_DELIVERY_THRESHOLD };
