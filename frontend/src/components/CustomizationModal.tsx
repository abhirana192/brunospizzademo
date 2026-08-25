import { useEffect, useMemo, useState } from "react";
import { CartLine, MenuItem, PizzaToppingFees, Topping } from "../types";
import { FoodImage } from "./FoodImage";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useMenuData } from "../context/MenuDataContext";

const CRUST_OPTIONS = ["Regular", "Thin Crust", "Thick Crust", "Stuffed Crust"];

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
    } else {
      addLine(line);
      showToast(`${item.name} added to your cart.`);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-title"
        className="relative bg-cream-50 w-full sm:max-w-lg sm:rounded-xl2 rounded-t-xl2 shadow-pop max-h-[92vh] overflow-y-auto animate-fadeUp"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
        >
          ✕
        </button>

        <FoodImage image={item.image} name={item.name} className="w-full h-48 rounded-t-xl2" />

        <div className="p-6">
          <h2 id="customize-title" className="font-display text-2xl font-bold text-charcoal-900">
            {item.name}
          </h2>
          {item.description && <p className="text-charcoal-500 mt-1 text-sm">{item.description}</p>}

          {/* Size */}
          <section className="mt-6">
            <h3 className="font-semibold text-charcoal-800 mb-3">Choose Size</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {item.sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSizeId(s.id)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left transition ${
                    sizeId === s.id ? "border-burgundy-600 bg-burgundy-50" : "border-charcoal-100 hover:border-charcoal-300"
                  }`}
                  aria-pressed={sizeId === s.id}
                >
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-charcoal-500 text-xs">${Number(s.price).toFixed(2)}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Crust - pizzas only */}
          {item.isPizza && (
            <section className="mt-6">
              <h3 className="font-semibold text-charcoal-800 mb-3">Crust</h3>
              <div className="flex flex-wrap gap-2">
                {CRUST_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCrust(c)}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition ${
                      crust === c ? "border-burgundy-600 bg-burgundy-50 text-burgundy-700" : "border-charcoal-100 hover:border-charcoal-300"
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
              <h3 className="font-semibold text-charcoal-800 mb-3">Toppings</h3>
              <div className="grid grid-cols-2 gap-2">
                {toppings.map((t) => {
                  const checked = selectedToppings.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 cursor-pointer transition ${
                        checked ? "border-burgundy-600 bg-burgundy-50" : "border-charcoal-100 hover:border-charcoal-300"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <input type="checkbox" className="accent-burgundy-600" checked={checked} onChange={() => toggleTopping(t.id)} />
                        {t.name}
                      </span>
                      <span className="text-xs text-charcoal-500">
                        +${toppingFee(t, selectedSize?.name ?? "", pizzaToppingFees).toFixed(2)}
                        {t.premium && <span className="ml-1 text-amber-600 font-semibold">★</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* Special instructions */}
          <section className="mt-6">
            <label className="label" htmlFor="instructions">
              Any special instructions?
            </label>
            <textarea
              id="instructions"
              className="input min-h-[80px] resize-none"
              maxLength={300}
              placeholder="e.g. extra crispy, light sauce, no onions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </section>

          {/* Quantity */}
          <section className="mt-6 flex items-center justify-between">
            <h3 className="font-semibold text-charcoal-800">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                className="h-9 w-9 rounded-full bg-cream-300 hover:bg-cream-400 font-bold text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold" aria-live="polite">
                {quantity}
              </span>
              <button
                className="h-9 w-9 rounded-full bg-cream-300 hover:bg-cream-400 font-bold text-lg"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </section>

          <button onClick={handleSave} className="btn-primary w-full mt-7 text-base py-3.5" disabled={!selectedSize}>
            {editingLine ? "Save Changes" : "Add to Cart"} · ${(unitPrice * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
