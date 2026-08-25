export function Logo({ className, stacked }: { className?: string; stacked?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden className="shrink-0">
        <circle cx="19" cy="19" r="17.25" fill="#7a1f13" />
        <circle cx="19" cy="19" r="17.25" fill="none" stroke="#f0a83c" strokeWidth="1" />
        <circle cx="19" cy="19" r="14.5" fill="none" stroke="#f0a83c" strokeWidth="0.6" opacity="0.6" />
        <text
          x="19"
          y="25.5"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="17"
          fontWeight="600"
          fill="#fdf8f3"
        >
          B
        </text>
      </svg>
      <span className={`font-display font-bold tracking-tight leading-none ${stacked ? "flex flex-col" : "text-xl"}`}>
        {stacked ? (
          <>
            <span className="text-lg">BRUNO'S</span>
            <span className="text-[0.6rem] font-semibold tracking-[0.25em] text-burgundy-600 uppercase mt-0.5">Deli &amp; Pizza</span>
          </>
        ) : (
          <>
            BRUNO'S <span className="text-burgundy-600">PIZZA</span>
          </>
        )}
      </span>
    </div>
  );
}
