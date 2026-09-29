import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CartLine, MenuItem, PizzaToppingFees, Topping } from "../types";
import { FoodImage } from "./FoodImage";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useMenuData } from "../context/MenuDataContext";

const CRUST_OPTIONS = ["Regular", "Thin Crust", "Thick Crust", "Stuffed Crust"];

const glassTextarea =
  "w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/10 transition min-h-[80px] resize-none";

// Standard toppings are charged per pizza size; premium toppings (specialty
// meats) are a flat add-on regardless of size. Mirrors the backend pricing
// in orders.service.ts - the backend is always the source of truth at checkout.
function toppingFee(topping: Topping, sizeName: string, fees: PizzaToppingFees): number {
  if (topping.premium) return fees.premium;
  const s = sizeName.toLowerCase();
  if (s.includes("large")) return fees.large;
  if (s.includes("medium")) return fees.medium;
  return fees.small;
}

export function CustomizationModal({
  item,
  editingLine,
  onClose,
}: {
  item: MenuItem;
  editingLine?: CartLine;
  onClose: () => void;
}) {
  const { addLine, updateLine } = useCart();
  const { showToast } = useToast();
  const { toppings, pizzaToppingFees } = useMenuData();

  const [sizeId, setSizeId] = useState(editingLine?.sizeId ?? item.sizes[0]?.id ?? "");
  const [crust, setCrust] = useState(editingLine?.customization.crust ?? "Regular");
  const [selectedToppings, setSelectedToppings] = useState<string[]>(editingLine?.customization.toppingIds ?? []);
  const [instructions, setInstructions] = useState(editingLine?.customization.specialInstructions ?? "");
  const [quantity, setQuantity] = useState(editingLine?.quantity ?? 1);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const selectedSize = item.sizes.find((s) => s.id === sizeId) ?? item.sizes[0];

  const unitPrice = useMemo(() => {
    const base = Number(selectedSize?.price ?? 0);
    const toppingsPrice = item.isPizza
      ? toppings
          .filter((t) => selectedToppings.includes(t.id))
          .reduce((sum, t) => sum + toppingFee(t, selectedSize?.name ?? "", pizzaToppingFees), 0)
      : 0;
    return base + toppingsPrice;
  }, [selectedSize, selectedToppings, toppings, item.isPizza, pizzaToppingFees]);

  function toggleTopping(id: string) {
    setSelectedToppings((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function handleSave() {
    if (!selectedSize) return;
    const toppingNames = toppings.filter((t) => selectedToppings.includes(t.id)).map((t) => t.name);
    const line: Omit<CartLine, "cartLineId"> = {
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      isPizza: item.isPizza,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      quantity,
      unitPrice,
      customization: {
        crust: item.isPizza ? crust : undefined,
        toppingIds: item.isPizza ? selectedToppings : [],
        toppingNames: item.isPizza ? toppingNames : [],
        specialInstructions: instructions.trim() || undefined,
      },
    };

    if (editingLine) {
      updateLine(editingLine.cartLineId, line);
      showToast(`${item.name} updated in your cart.`);
      onClose();
    } else {
      addLine(line);
      showToast(`${item.name} added to your cart.`);
      setJustSaved(true);
      setTimeout(onClose, 500);
    }
  }

  // Portalled to document.body: MenuItemCard's Tilt3D wrapper sets an inline
  // CSS transform on hover, and any transform creates a containing block
  // that traps position:fixed descendants - without a portal this would
  // render confined to that card instead of as a true full-viewport dialog.
  //
  // Portals only change where the DOM node lives, not React's event tree, so
  // a wheel/touch gesture here still bubbles in React up through
  // MenuItemCard. stopPropagation keeps that from reaching page-level
  // scroll/gesture handling (e.g. Home's scroll-to-menu listener if this is
  // ever opened from there) while the modal is open.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-title"
        className="relative bg-white/10 backdrop-blur-2xl border border-white/15 w-full sm:max-w-lg sm:rounded-xl2 rounded-t-xl2 shadow-premium max-h-[92vh] flex flex-col animate-fadeUp"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-black/30 border border-white/10 text-white flex items-center justify-center hover:bg-black/40 transition-transform hover:scale-105"
        >
          ✕
        </button>

        <div className="overflow-y-auto flex-1 no-scrollbar" data-lenis-prevent>
          <FoodImage image={item.image} name={item.name} className="w-full h-48 sm:rounded-t-xl2" />

          <div className="p-6">
            <h2 id="customize-title" className="font-display text-2xl font-bold text-white drop-shadow-sm">
              {item.name}
            </h2>
            {item.description && <p className="text-white/60 mt-1 text-sm">{item.description}</p>}

            {/* Size */}
            <section className="mt-6">
              <h3 className="font-semibold text-white mb-3">Choose Size</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {item.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                      sizeId === s.id
                        ? "border-amber-400 bg-amber-400/10 scale-[1.02]"
                        : "border-white/15 bg-white/5 hover:border-white/30"
                    }`}
                    aria-pressed={sizeId === s.id}
                  >
                    <div className="font-semibold text-sm text-white">{s.name}</div>
                    <div className="text-white/50 text-xs">${Number(s.price).toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Crust - pizzas only */}
            {item.isPizza && (
              <section className="mt-6">
                <h3 className="font-semibold text-white mb-3">Crust</h3>
                <div className="flex flex-wrap gap-2">
                  {CRUST_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCrust(c)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                        crust === c
                          ? "border-amber-400 bg-amber-400/10 text-amber-300 scale-[1.03]"
                          : "border-white/15 text-white/70 hover:border-white/30"
                      }`}
                      aria-pressed={crust === c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Toppings - pizzas only */}
            {item.isPizza && (
              <section className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Toppings</h3>
                  {selectedToppings.length > 0 && (
                    <span className="text-xs font-bold text-amber-300 bg-amber-400/10 rounded-full px-2.5 py-1 animate-fadeUp">
                      {selectedToppings.length} selected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {toppings.map((t) => {
                    const checked = selectedToppings.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 cursor-pointer transition-all ${
                          checked ? "border-amber-400 bg-amber-400/10 scale-[1.02]" : "border-white/15 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-white/90">
                          <input type="checkbox" className="accent-amber-400" checked={checked} onChange={() => toggleTopping(t.id)} />
                          {t.name}
                        </span>
                        <span className="text-xs text-white/50 whitespace-nowrap">
                          +${toppingFee(t, selectedSize?.name ?? "", pizzaToppingFees).toFixed(2)}
                          {t.premium && <span className="ml-1 text-amber-400 font-semibold">★</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Special instructions */}
            <section className="mt-6">
              <label className="block text-sm font-semibold text-white/80 mb-1.5" htmlFor="instructions">
                Any special instructions?
              </label>
              <textarea
                id="instructions"
                className={glassTextarea}
                maxLength={300}
                placeholder="e.g. extra crispy, light sauce, no onions..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </section>

            {/* Quantity */}
            <section className="mt-6 flex items-center justify-between">
              <h3 className="font-semibold text-white">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold text-lg transition-transform active:scale-90"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-white" aria-live="polite">
                  {quantity}
                </span>
                <button
                  className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold text-lg transition-transform active:scale-90"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Sticky action bar - always visible, no scrolling required to order */}
        <div className="border-t border-white/10 p-4 sm:p-5 bg-white/5 sm:rounded-b-xl2">
          <button
            onClick={handleSave}
            className={`btn-primary w-full text-base py-3.5 transition-all ${justSaved ? "!bg-green-600" : ""}`}
            disabled={!selectedSize || justSaved}
          >
            {justSaved ? "✓ Added to Cart" : `${editingLine ? "Save Changes" : "Add to Cart"} · $${(unitPrice * quantity).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
