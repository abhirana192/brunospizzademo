import { Link } from "react-router-dom";
import { Deal } from "../types";
import { FoodImage } from "./FoodImage";

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="card overflow-hidden flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-5">
      <FoodImage image={deal.image} name={deal.name} className="w-full sm:w-40 h-36 sm:h-32 shrink-0" />
      <div className="p-5 sm:pl-0 flex-1">
        <h3 className="font-display font-bold text-lg text-charcoal-900">{deal.name}</h3>
        {deal.description && <p className="text-sm text-charcoal-500 mt-1">{deal.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-burgundy-600 text-lg">${Number(deal.price).toFixed(2)}</span>
          <Link to="/menu" className="btn-primary !px-4 !py-2 text-xs">
            Order Now
          </Link>
        </div>
      </div>
    </div>
  );
}
