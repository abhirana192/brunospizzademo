import { Link } from "react-router-dom";
import { useMenuData } from "../../context/MenuDataContext";
import { DealCard } from "../DealCard";

export function DealsPreview() {
  const { deals, loading } = useMenuData();

  if (!loading && deals.length === 0) return null;

  return (
    <section className="bg-burgundy-600 py-16 sm:py-20">
      <div className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-amber-300 font-semibold tracking-widest text-xs uppercase">Save more</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-50 mt-1">Today's Deals</h2>
          </div>
          <Link to="/deals" className="text-cream-50 font-semibold text-sm hover:underline hidden sm:block">
            See all deals →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {deals.slice(0, 3).map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}
