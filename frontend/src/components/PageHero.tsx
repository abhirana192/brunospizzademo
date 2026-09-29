export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative overflow-hidden bg-charcoal-900 min-h-[42vh] sm:min-h-[46vh] flex items-end">
      <img src={image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/55 to-charcoal-950/10" />
      <div className="section relative pb-12 sm:pb-16 animate-fadeUp">
        <span className="text-amber-400 font-bold tracking-[0.2em] text-xs uppercase">{eyebrow}</span>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cream-50 mt-2 leading-[0.95]">{title}</h1>
        {subtitle && <p className="text-charcoal-100/80 text-lg mt-3 max-w-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
