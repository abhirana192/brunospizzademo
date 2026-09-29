import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useMenuData } from "../context/MenuDataContext";
import { FoodImage } from "./FoodImage";
import { CustomizationModal } from "./CustomizationModal";
import { CartLine } from "../types";
import { useOrderType } from "../context/OrderTypeContext";
import { FreeDeliveryProgress } from "./FreeDeliveryProgress";
import { UpsellSuggestions } from "./UpsellSuggestions";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, removeLine, subtotal } = useCart();
  const { findMenuItem } = useMenuData();
  const { orderType } = useOrderType();
  const [editingLine, setEditingLine] = useState<CartLine | null>(null);
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end"
        onWheel={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={onClose} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className="relative bg-white/10 backdrop-blur-2xl w-full sm:w-[420px] h-full shadow-premium flex flex-col animate-fadeUp border-l border-white/15"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="font-display text-xl font-bold text-white">Your Cart</h2>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar" data-lenis-prevent>
            {lines.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🛒</div>
                <p className="text-white/60">Your cart is empty.</p>
                <button className="btn-primary mt-5" onClick={onClose}>
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {orderType === "DELIVERY" && <FreeDeliveryProgress subtotal={subtotal} transparent />}

                {lines.map((line) => (
                  <div key={line.cartLineId} className="flex gap-3 border-b border-white/10 pb-4 animate-fadeUp">
                    <FoodImage image={line.image} name={line.name} className="w-16 h-16 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-semibold text-sm text-white truncate">{line.name}</h3>
                        <span className="font-semibold text-sm whitespace-nowrap text-white">${(line.unitPrice * line.quantity).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        {line.sizeName}
                        {line.customization.crust ? ` · ${line.customization.crust}` : ""}
                      </p>
                      {line.customization.toppingNames.length > 0 && (
                        <p className="text-xs text-white/40 mt-0.5 truncate">{line.customization.toppingNames.join(", ")}</p>
                      )}
                      {line.customization.specialInstructions && (
                        <p className="text-xs italic text-amber-300 mt-0.5">"{line.customization.specialInstructions}"</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                        <span className="text-white/50">Qty {line.quantity}</span>
                        <button
                          className="text-amber-300 hover:text-amber-200 hover:underline"
                          onClick={() => {
                            const item = findMenuItem(line.menuItemId);
                            if (item) setEditingLine(line);
                          }}
                        >
                          Edit
                        </button>
                        <button className="text-white/40 hover:text-amber-300 hover:underline" onClick={() => removeLine(line.cartLineId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <UpsellSuggestions transparent />
              </>
            )}
          </div>

          {lines.length > 0 && (
            <div className="border-t border-white/10 p-5 space-y-3">
              <div className="flex justify-between text-sm text-white/60">
                <span>Subtotal (before taxes)</span>
                <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-white/40">Final price, including tax, is confirmed at checkout.</p>
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
