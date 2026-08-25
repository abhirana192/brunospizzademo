import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useMenuData } from "../context/MenuDataContext";
import { FoodImage } from "./FoodImage";
import { CustomizationModal } from "./CustomizationModal";
import { CartLine } from "../types";
import { useOrderType } from "../context/OrderTypeContext";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, removeLine, subtotal } = useCart();
  const { findMenuItem } = useMenuData();
  const { orderType } = useOrderType();
  const [editingLine, setEditingLine] = useState<CartLine | null>(null);
  const navigate = useNavigate();

  if (!open) return null;

  const deliveryNote = orderType === "DELIVERY" ? "Delivery fee calculated at checkout" : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-charcoal-900/60" onClick={onClose} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className="relative bg-cream-50 w-full sm:w-[420px] h-full shadow-pop flex flex-col animate-fadeUp"
        >
          <div className="flex items-center justify-between p-5 border-b border-charcoal-100">
            <h2 className="font-display text-xl font-bold">Your Cart</h2>
            <button onClick={onClose} aria-label="Close cart" className="h-9 w-9 rounded-full hover:bg-cream-300 flex items-center justify-center">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {lines.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🛒</div>
                <p className="text-charcoal-500">Your cart is empty.</p>
                <button className="btn-secondary mt-5" onClick={onClose}>
                  Browse Menu
                </button>
              </div>
            ) : (
              lines.map((line) => (
                <div key={line.cartLineId} className="flex gap-3 border-b border-charcoal-50 pb-4">
                  <FoodImage image={line.image} name={line.name} className="w-16 h-16 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-semibold text-sm text-charcoal-900 truncate">{line.name}</h3>
                      <span className="font-semibold text-sm whitespace-nowrap">${(line.unitPrice * line.quantity).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      {line.sizeName}
                      {line.customization.crust ? ` · ${line.customization.crust}` : ""}
                    </p>
                    {line.customization.toppingNames.length > 0 && (
                      <p className="text-xs text-charcoal-400 mt-0.5 truncate">{line.customization.toppingNames.join(", ")}</p>
                    )}
                    {line.customization.specialInstructions && (
                      <p className="text-xs italic text-burgundy-600 mt-0.5">"{line.customization.specialInstructions}"</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                      <span className="text-charcoal-500">Qty {line.quantity}</span>
                      <button
                        className="text-burgundy-600 hover:underline"
                        onClick={() => {
                          const item = findMenuItem(line.menuItemId);
                          if (item) setEditingLine(line);
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-charcoal-400 hover:text-burgundy-600 hover:underline" onClick={() => removeLine(line.cartLineId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {lines.length > 0 && (
            <div className="border-t border-charcoal-100 p-5 space-y-3">
              <div className="flex justify-between text-sm text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">${subtotal.toFixed(2)}</span>
              </div>
              {deliveryNote && <p className="text-xs text-charcoal-400">{deliveryNote}</p>}
              <button
                className="btn-primary w-full text-base py-3.5"
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
              >
                Checkout
              </button>
            </div>
          )}
        </aside>
      </div>

      {editingLine &&
        (() => {
          const item = findMenuItem(editingLine.menuItemId);
          if (!item) return null;
          return <CustomizationModal item={item} editingLine={editingLine} onClose={() => setEditingLine(null)} />;
        })()}
    </>
  );
}
