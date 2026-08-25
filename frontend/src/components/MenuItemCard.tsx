import { useState } from "react";
import { MenuItem } from "../types";
import { FoodImage } from "./FoodImage";
import { CustomizationModal } from "./CustomizationModal";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const lowestPrice = Math.min(...item.sizes.map((s) => Number(s.price)));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="card text-left overflow-hidden group hover:-translate-y-1 transition-transform duration-200 w-full"
      >
        <FoodImage image={item.image} name={item.name} className="w-full h-40 group-hover:scale-105 transition-transform duration-300" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-lg text-charcoal-900 leading-snug">{item.name}</h3>
          </div>
          {item.description && <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">{item.description}</p>}
          <div className="flex items-center justify-between mt-3">
            <span className="font-semibold text-burgundy-600">
              {item.sizes.length > 1 ? "From " : ""}${lowestPrice.toFixed(2)}
            </span>
            <span className="btn-primary !px-4 !py-2 text-xs">Add</span>
          </div>
        </div>
      </button>
      {open && <CustomizationModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
