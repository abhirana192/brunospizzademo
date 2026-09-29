export function AboutSection() {
  return (
    <section className="bg-charcoal-950 py-16 sm:py-20">
      <div className="section grid md:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 md:order-1">
          <img
            src="/images/food/about-oven.jpg"
            alt="Pizza baking in a wood-fired oven"
            loading="lazy"
            className="w-full h-72 sm:h-96 object-cover rounded-xl2 shadow-premium border border-white/10"
          />
        </div>
        <div className="order-1 md:order-2">
          <span className="text-amber-400 font-semibold tracking-widest text-xs uppercase">Our Story</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-50 mt-1">About Bruno's Deli & Pizza</h2>
          <p className="text-white/65 mt-4 leading-relaxed">
            We started our business in 1987 with one goal in mind: providing an enjoyable pizza experience to the
            Yellowknife area. Thanks to our experience and dedication, we've managed to become masters of the pizza
            trade — providing dishes that are fresh, hearty and simply unforgettable.
          </p>
          <p className="text-white/65 mt-4 leading-relaxed">
            No gimmicks, no upsells — just honest, hot, fresh pizza, made the way it should be.
          </p>
        </div>
      </div>
    </section>
  );
}
