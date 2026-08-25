const REVIEWS = [
  { name: "Jordan M.", rating: 5, text: "Best pizza in the neighborhood, hands down. The crust is perfect every single time." },
  { name: "Priya S.", rating: 5, text: "Ordering online was so easy and the pickup was ready right on time. Will be back!" },
  { name: "Marcus T.", rating: 5, text: "The BBQ Chicken pizza is unreal. Delivery was fast and the driver was super friendly." },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden>{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <section className="section py-16 sm:py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-amber-600 font-semibold tracking-widest text-xs uppercase">Customer Love</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">What People Are Saying</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((r) => (
          <div key={r.name} className="card p-6">
            <Stars rating={r.rating} />
            <p className="text-charcoal-600 mt-3 leading-relaxed">"{r.text}"</p>
            <p className="font-semibold text-charcoal-900 mt-4 text-sm">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
