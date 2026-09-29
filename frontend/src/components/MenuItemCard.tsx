import { useState } from "react";
import { MenuItem } from "../types";
import { FoodImage } from "./FoodImage";
import { CustomizationModal } from "./CustomizationModal";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Tilt3D } from "./Tilt3D";

export function MenuItemCard({
  item,
  transparent = false,
  compact = false,
}: {
  item: MenuItem;
  transparent?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addLine } = useCart();
  const { showToast } = useToast();
  const lowestPrice = Math.min(...item.sizes.map((s) => Number(s.price)));
  const isSimple = item.sizes.length === 1 && !item.isPizza;

  function handleActionClick() {
    if (isSimple) {
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
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    } else {
      setOpen(true);
    }
  }

  return (
    <>
      <Tilt3D
        max={5}
        scale={1.015}
        className={
          transparent
            ? "rounded-xl2 overflow-hidden group bg-white/10 backdrop-blur-xl border border-white/15 hover:bg-white/15 transition-colors duration-300 relative"
            : "card overflow-hidden group hover:shadow-pop transition-shadow duration-300 relative"
        }
      >
        {item.featured && (
          <span className="absolute top-3 left-3 z-10 bg-gold text-charcoal-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            🔥 Popular
          </span>
        )}
        <button onClick={() => setOpen(true)} className="block w-full text-left" aria-label={`View ${item.name} details`}>
          <FoodImage
            image={item.image}
            name={item.name}
            className={`w-full group-hover:scale-105 transition-transform duration-300 ${compact ? "h-24" : "h-40"}`}
          />
          <div className={compact ? "p-2.5 pb-1.5" : "px-5 pt-4 pb-3"}>
            {/* Fixed-height, vertically-centered block: every card lands at the same
                total height, but items with no description aren't left with dead
                space below the title - it centers in the reserved area instead. */}
            <div className={`flex flex-col justify-center ${compact ? "min-h-[54px]" : "min-h-[74px]"}`}>
              <h3
                className={`font-display font-bold leading-snug line-clamp-1 ${compact ? "text-sm" : "text-xl tracking-tight"} ${
                  transparent ? "text-white drop-shadow-sm" : "text-charcoal-900"
                }`}
              >
                {item.name}
              </h3>
              {item.description && (
                <p
                  className={`line-clamp-2 ${compact ? "mt-1 text-[11px]" : "mt-1.5 text-sm leading-relaxed"} ${
                    transparent ? "text-white/65" : "text-charcoal-500"
                  }`}
                >
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </button>
        <div
          className={`flex items-center justify-between ${compact ? "px-2.5 pb-2.5" : "px-5 pb-4 pt-3 border-t"} ${
            transparent ? "border-white/10" : "border-charcoal-100"
          }`}
        >
          <div>
            {!compact && (
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${transparent ? "text-white/40" : "text-charcoal-400"}`}>
                {item.sizes.length > 1 ? "Starting at" : "Price"}
              </p>
            )}
            <span
              className={`font-bold ${compact ? "text-xs" : "text-lg"} ${transparent ? "text-amber-300" : "text-burgundy-600"}`}
            >
              {compact && item.sizes.length > 1 ? "From " : ""}${lowestPrice.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleActionClick}
            className={`transition-all ${compact ? "!px-3 !py-1.5 text-[11px]" : "!px-5 !py-2.5 text-sm"} ${
              justAdded ? "btn-primary !bg-green-600" : "btn-primary"
            }`}
          >
            {justAdded ? "✓ Added" : isSimple ? "+ Quick Add" : "Customize"}
          </button>
        </div>
      </Tilt3D>
      {open && <CustomizationModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
