import { useMemo, useState } from "react";
import { useMenuData } from "../context/MenuDataContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { FoodImage } from "./FoodImage";
import { CustomizationModal } from "./CustomizationModal";
import { MenuItem } from "../types";

const SUGGEST_SLUGS = ["drinks", "desserts", "snacks"];

export function UpsellSuggestions({ transparent = false }: { transparent?: boolean }) {
  const { categories } = useMenuData();
  const { lines, addLine } = useCart();
  const { showToast } = useToast();
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  const suggestions = useMemo(() => {
    const inCart = new Set(lines.map((l) => l.menuItemId));
    const pool = categories
      .filter((c) => SUGGEST_SLUGS.includes(c.slug))
      .flatMap((c) => c.menuItems)
      .filter((m) => m.active && !inCart.has(m.id));

    // Prefer featured items, then fall back to whatever's left, capped at 3.
    const featured = pool.filter((m) => m.featured);
    const rest = pool.filter((m) => !m.featured);
    return [...featured, ...rest].slice(0, 3);
  }, [categories, lines]);

  if (suggestions.length === 0) return null;

  function quickAdd(item: MenuItem) {
    if (item.sizes.length === 1 && !item.isPizza) {
      const size = item.sizes[0];
      addLine({
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        isPizza: false,
        sizeId: size.id,
        sizeName: size.name,
        quantity: 1,
        unitPrice: Number(size.price),
        customization: { toppingIds: [], toppingNames: [] },
      });
      showToast(`${item.name} added to your cart.`);
    } else {
      setModalItem(item);
    }
  }

  return (
    <div className={`border-t pt-4 ${transparent ? "border-white/10" : "border-cream-200"}`}>
      <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${transparent ? "text-amber-300" : "text-burgundy-600"}`}>
        Complete your order
      </h3>
      <div className="space-y-2.5">
        {suggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => quickAdd(item)}
            className={`w-full flex items-center gap-3 rounded-xl border p-2 transition text-left group ${
              transparent
                ? "border-white/15 bg-white/5 hover:border-amber-400/40 hover:bg-white/10"
                : "border-cream-200 bg-white hover:border-burgundy-300 hover:bg-burgundy-50"
            }`}
          >
            <FoodImage image={item.image} name={item.name} className="w-11 h-11 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${transparent ? "text-white" : "text-charcoal-900"}`}>{item.name}</p>
              <p className={`text-xs ${transparent ? "text-white/50" : "text-charcoal-500"}`}>
                From ${Math.min(...item.sizes.map((s) => Number(s.price))).toFixed(2)}
              </p>
            </div>
            <span
              className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm transition-colors shrink-0 ${
                transparent
                  ? "bg-white/10 text-white group-hover:bg-amber-400 group-hover:text-charcoal-900"
                  : "bg-cream-200 text-charcoal-900 group-hover:bg-burgundy-600 group-hover:text-white"
              }`}
            >
              +
            </span>
          </button>
        ))}
      </div>
      {modalItem && <CustomizationModal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}
