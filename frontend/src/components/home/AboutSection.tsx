export function AboutSection() {
  return (
    <section className="bg-cream-200 py-16 sm:py-20">
      <div className="section grid md:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 md:order-1">
          <img
            src="/images/food/about-oven.jpg"
            alt="Pizza baking in a wood-fired oven"
            loading="lazy"
            className="w-full h-72 sm:h-96 object-cover rounded-xl2 shadow-card"
          />
        </div>
        <div className="order-1 md:order-2">
          <span className="text-amber-600 font-semibold tracking-widest text-xs uppercase">Our Story</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">About Bruno's Deli & Pizza</h2>
          <p className="text-charcoal-600 mt-4 leading-relaxed">
            Bruno's Deli & Pizza started with one simple idea: pizza should be made fresh, from real ingredients, for real neighbors.
            Every pie is handcrafted to order — never frozen, never rushed. Whether you're picking up on your way home or
            having it delivered to your door, we treat every order like it's for family.
          </p>
          <p className="text-charcoal-600 mt-4 leading-relaxed">
            No gimmicks, no upsells — just honest, hot, fresh pizza, made the way it should be.
          </p>
        </div>
      </div>
    </section>
  );
}
