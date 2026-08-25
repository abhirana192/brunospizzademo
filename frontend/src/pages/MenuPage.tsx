import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMenuData } from "../context/MenuDataContext";
import { MenuItemCard } from "../components/MenuItemCard";
import { GridSkeleton } from "../components/LoadingSkeleton";
import { useOrderType } from "../context/OrderTypeContext";
import { OrderType } from "../types";

const CATEGORY_ICONS: Record<string, string> = {
  pizzas: "🍕",
  snacks: "🍗",
  salads: "🥗",
  "hot-sandwiches": "🥪",
  others: "🍽️",
  "chinese-menu": "🥡",
  drinks: "🥤",
  desserts: "🍰",
};

export function MenuPage() {
  const { categories, loading, error } = useMenuData();
  const { orderType, setOrderType } = useOrderType();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const active = activeSlug ?? categories[0]?.slug ?? null;
  const activeCategory = categories.find((c) => c.slug === active);

  return (
    <div className="section py-10 sm:py-14">
      <Helmet>
        <title>Menu — Bruno's Deli &amp; Pizza</title>
        <meta name="description" content="Browse the full Bruno's Deli & Pizza menu: handcrafted pizza, snacks, salads, hot sandwiches, Chinese food, and more." />
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-amber-600 font-semibold tracking-widest text-xs uppercase">Full Menu</span>
          <h1 className="font-display text-4xl font-bold text-charcoal-900 mt-1">Order Online</h1>
        </div>

        <div className="flex rounded-full border-2 border-charcoal-100 p-1 w-fit" role="group" aria-label="Order type">
          {(["PICKUP", "DELIVERY"] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                orderType === t ? "bg-burgundy-600 text-white" : "text-charcoal-600 hover:bg-cream-300"
              }`}
              aria-pressed={orderType === t}
            >
              {t === "PICKUP" ? "Pickup" : "Delivery"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-burgundy-600 text-center py-10">{error}</p>}

      {!error && (
        <>
          {/* Category tabs */}
          <div className="sticky top-[73px] z-20 bg-cream-100/95 backdrop-blur -mx-5 sm:mx-0 px-5 sm:px-0 py-3 mb-8 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {(loading ? Array.from({ length: 4 }) : categories).map((c: any, i) => (
                <button
                  key={c?.id ?? i}
                  disabled={loading}
                  onClick={() => setActiveSlug(c.slug)}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    active === c?.slug ? "bg-burgundy-600 text-white" : "bg-white text-charcoal-700 hover:bg-cream-300"
                  } ${loading ? "skeleton !bg-none w-24 h-10" : ""}`}
                >
                  {c && <span aria-hidden>{CATEGORY_ICONS[c.slug] ?? ""}</span>}
                  {c?.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <GridSkeleton count={6} />
          ) : (
            <section aria-label={activeCategory?.name}>
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="text-2xl" aria-hidden>{CATEGORY_ICONS[activeCategory?.slug ?? ""] ?? ""}</span>
                <h2 className="font-display text-2xl font-bold text-charcoal-900">{activeCategory?.name}</h2>
              </div>
              {activeCategory?.description && <p className="text-charcoal-500 mb-6">{activeCategory.description}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeCategory?.menuItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
              {activeCategory?.menuItems.length === 0 && (
                <p className="text-center text-charcoal-400 py-10">No items in this category right now.</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
