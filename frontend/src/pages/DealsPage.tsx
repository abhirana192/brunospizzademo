import { Helmet } from "react-helmet-async";
import { useMenuData } from "../context/MenuDataContext";
import { DealCard } from "../components/DealCard";

export function DealsPage() {
  const { deals, loading, error } = useMenuData();

  return (
    <div className="section py-14">
      <Helmet>
        <title>Deals — Bruno's Deli & Pizza</title>
        <meta name="description" content="Save more with Bruno's Deli & Pizza combo deals, family feasts, and student specials." />
      </Helmet>
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-amber-600 font-semibold tracking-widest text-xs uppercase">Save more</span>
        <h1 className="font-display text-4xl font-bold text-charcoal-900 mt-1">Deals</h1>
      </div>

      {error && <p className="text-center text-burgundy-600">{error}</p>}
      {loading && <p className="text-center text-charcoal-400">Loading deals…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
