import { useNavigate } from "react-router-dom";
import { useOrderType } from "../../context/OrderTypeContext";
import { OrderType } from "../../types";

export function QuickOrder() {
  const { orderType, setOrderType } = useOrderType();
  const navigate = useNavigate();

  function choose(type: OrderType) {
    setOrderType(type);
    navigate("/menu");
  }

  return (
    <section className="bg-charcoal-800 border-b border-white/10">
      <div className="section flex flex-col sm:flex-row items-center justify-between gap-5 py-6">
        <p className="font-display text-lg sm:text-xl font-semibold text-cream-50">What are you ordering for?</p>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => choose("PICKUP")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full border-2 px-6 py-3 font-bold tracking-wide transition-all ${
              orderType === "PICKUP"
                ? "border-amber-400 bg-amber-400 text-charcoal-900"
                : "border-white/25 text-cream-100 hover:border-white/50"
            }`}
          >
            <span aria-hidden>🏠</span> PICKUP
          </button>
          <button
            onClick={() => choose("DELIVERY")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full border-2 px-6 py-3 font-bold tracking-wide transition-all ${
              orderType === "DELIVERY"
                ? "border-amber-400 bg-amber-400 text-charcoal-900"
                : "border-white/25 text-cream-100 hover:border-white/50"
            }`}
          >
            <span aria-hidden>🚗</span> DELIVERY
          </button>
        </div>
      </div>
    </section>
  );
}
