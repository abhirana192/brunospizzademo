import { FormEvent, useState } from "react";
import { Category, MenuItem } from "../../types";
import { adminMenuApi, MenuItemInput } from "../../api/admin";
import { useToast } from "../../context/ToastContext";

interface SizeRow {
  id?: string;
  name: string;
  price: string;
}

export function MenuItemFormModal({
  item,
  categories,
  onClose,
  onSaved,
}: {
  item: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? "");
  const [isPizza, setIsPizza] = useState(item?.isPizza ?? false);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [active, setActive] = useState(item?.active ?? true);
  const [image, setImage] = useState(item?.image ?? "");
  const [sizes, setSizes] = useState<SizeRow[]>(
    item?.sizes.map((s) => ({ id: s.id, name: s.name, price: s.price })) ?? [{ name: "Regular", price: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSize(index: number, updates: Partial<SizeRow>) {
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }
  function addSize() {
    setSizes((prev) => [...prev, { name: "", price: "" }]);
  }
  function removeSize(index: number) {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: MenuItemInput = {
        categoryId,
        name,
        description: description || undefined,
        image: image || undefined,
        active,
        isPizza,
        featured,
        sizes: sizes
          .filter((s) => s.name.trim() && s.price !== "")
          .map((s) => ({ id: s.id, name: s.name.trim(), price: Number(s.price) })),
      };
      if (payload.sizes.length === 0) throw new Error("Add at least one size and price.");

      if (item) {
        await adminMenuApi.updateItem(item.id, payload);
        showToast("Menu item updated.");
      } else {
        await adminMenuApi.createItem(payload);
        showToast("Menu item created.");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the menu item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-xl2 shadow-pop p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="font-display font-bold text-xl">{item ? "Edit Menu Item" : "Add Menu Item"}</h2>

        <div>
          <label className="label">Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[70px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Image path</label>
            <input className="input" placeholder="/images/food/pizza-classic.jpg" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="accent-burgundy-600" checked={isPizza} onChange={(e) => setIsPizza(e.target.checked)} />
            Is a pizza (enables crust &amp; toppings)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="accent-burgundy-600" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured on homepage
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="accent-burgundy-600" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Available for ordering
        </label>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label !mb-0">Sizes &amp; Prices</label>
            <button type="button" className="text-xs font-semibold text-burgundy-600" onClick={addSize}>+ Add size</button>
          </div>
          <div className="space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" placeholder="Size name" value={s.name} onChange={(e) => updateSize(i, { name: e.target.value })} />
                <input className="input w-28" type="number" step="0.01" min="0" placeholder="Price" value={s.price} onChange={(e) => updateSize(i, { price: e.target.value })} />
                <button type="button" className="text-charcoal-400 hover:text-burgundy-600 px-2" onClick={() => removeSize(i)} aria-label="Remove size">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-burgundy-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
