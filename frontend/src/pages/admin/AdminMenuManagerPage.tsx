import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { adminMenuApi } from "../../api/admin";
import { Category, Deal, MenuItem, Topping } from "../../types";
import { useToast } from "../../context/ToastContext";
import { MenuItemFormModal } from "../../components/admin/MenuItemFormModal";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";

type Tab = "items" | "categories" | "toppings" | "deals";

export function AdminMenuManagerPage() {
  const [tab, setTab] = useState<Tab>("items");
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function loadAll() {
    setLoading(true);
    try {
      const [c, i, t, d] = await Promise.all([
        adminMenuApi.listCategories(),
        adminMenuApi.listItems(),
        adminMenuApi.listToppings(),
        adminMenuApi.listDeals(),
      ]);
      setCategories(c.categories);
      setItems(i.items);
      setToppings(t.toppings);
      setDeals(d.deals);
    } catch {
      showToast("Couldn't load menu data.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Helmet><title>Menu Management — Bruno's Deli & Pizza Admin</title></Helmet>

      <div className="flex gap-2 mb-6">
        {(["items", "categories", "toppings", "deals"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${tab === t ? "bg-burgundy-600 text-white" : "bg-white hover:bg-cream-300"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-charcoal-400">Loading…</p>
      ) : (
        <>
          {tab === "items" && <ItemsTab items={items} categories={categories} onChange={loadAll} />}
          {tab === "categories" && <CategoriesTab categories={categories} onChange={loadAll} />}
          {tab === "toppings" && <ToppingsTab toppings={toppings} onChange={loadAll} />}
          {tab === "deals" && <DealsTab deals={deals} onChange={loadAll} />}
        </>
      )}
    </div>
  );
}

function ItemsTab({ items, categories, onChange }: { items: MenuItem[]; categories: Category[]; onChange: () => void }) {
  const [editing, setEditing] = useState<MenuItem | null | "new">(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const { showToast } = useToast();

  return (
    <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-charcoal-100">
        <h2 className="font-display font-bold">Menu Items</h2>
        <button className="btn-primary !py-2 !px-4 text-sm" onClick={() => setEditing("new")}>+ Add Item</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-charcoal-500 text-xs uppercase">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-charcoal-50">
                <td className="p-3 font-semibold">{item.name}{item.featured && <span className="ml-2 text-[10px] bg-amber-400/30 text-amber-700 rounded-full px-2 py-0.5">Featured</span>}</td>
                <td className="p-3 text-charcoal-500">{categories.find((c) => c.id === item.categoryId)?.name ?? "—"}</td>
                <td className="p-3">{item.sizes.length ? `$${Math.min(...item.sizes.map((s) => Number(s.price))).toFixed(2)}` : "—"}</td>
                <td className="p-3">
                  <button
                    onClick={async () => {
                      await adminMenuApi.updateItem(item.id, { ...item, categoryId: item.categoryId, description: item.description ?? undefined, image: item.image ?? undefined, active: !item.active, sizes: item.sizes.map((s) => ({ id: s.id, name: s.name, price: Number(s.price) })) });
                      showToast(!item.active ? "Item enabled." : "Item disabled.");
                      onChange();
                    }}
                    className={`text-xs font-bold rounded-full px-3 py-1 ${item.active ? "bg-green-100 text-green-700" : "bg-charcoal-100 text-charcoal-500"}`}
                  >
                    {item.active ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button className="text-burgundy-600 font-semibold text-xs hover:underline mr-3" onClick={() => setEditing(item)}>Edit</button>
                  <button className="text-charcoal-400 font-semibold text-xs hover:underline" onClick={() => setDeleting(item)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <MenuItemFormModal item={editing === "new" ? null : editing} categories={categories} onClose={() => setEditing(null)} onSaved={onChange} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete menu item?"
          message={`"${deleting.name}" will be permanently removed. This won't affect past orders.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await adminMenuApi.deleteItem(deleting.id);
            showToast("Menu item deleted.");
            setDeleting(null);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function CategoriesTab({ categories, onChange }: { categories: Category[]; onChange: () => void }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function addCategory() {
    if (!name || !slug) return;
    try {
      await adminMenuApi.createCategory({ name, slug, sortOrder: categories.length });
      setName("");
      setSlug("");
      showToast("Category created.");
      onChange();
    } catch {
      showToast("Couldn't create category.", "error");
    }
  }

  return (
    <div className="bg-white rounded-xl2 shadow-card p-4">
      <div className="flex gap-2 mb-4">
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="slug-like-this" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button className="btn-primary !px-4 whitespace-nowrap" onClick={addCategory}>Add</button>
      </div>
      <ul className="divide-y divide-charcoal-50">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-charcoal-400">/{c.slug}</div>
            </div>
            <button
              onClick={async () => {
                await adminMenuApi.updateCategory(c.id, { active: !c.active });
                onChange();
              }}
              className={`text-xs font-bold rounded-full px-3 py-1 ${c.active ? "bg-green-100 text-green-700" : "bg-charcoal-100 text-charcoal-500"}`}
            >
              {c.active ? "Active" : "Disabled"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToppingsTab({ toppings, onChange }: { toppings: Topping[]; onChange: () => void }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  async function addTopping() {
    if (!name || price === "") return;
    try {
      await adminMenuApi.createTopping({ name, price: Number(price), sortOrder: toppings.length });
      setName("");
      setPrice("");
      showToast("Topping added.");
      onChange();
    } catch {
      showToast("Couldn't add topping.", "error");
    }
  }

  return (
    <div className="bg-white rounded-xl2 shadow-card p-4">
      <p className="text-xs text-charcoal-400 mb-4">
        Standard toppings are charged the restaurant-wide per-size fee (set via env vars). Premium toppings use their own price below as a flat add-on regardless of size.
      </p>
      <div className="flex gap-2 mb-4">
        <input className="input" placeholder="Topping name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input w-32" type="number" step="0.01" placeholder="Premium price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button className="btn-primary !px-4 whitespace-nowrap" onClick={addTopping}>Add</button>
      </div>
      <ul className="divide-y divide-charcoal-50">
        {toppings.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-3 gap-3">
            <span className="font-semibold text-sm flex-1">{t.name}</span>
            <input
              type="number"
              step="0.01"
              className="input !py-1.5 w-24 text-sm"
              disabled={!t.premium}
              title={t.premium ? "Flat premium add-on price" : "Standard toppings use the restaurant-wide per-size fee"}
              defaultValue={t.price}
              onBlur={async (e) => {
                const val = Number(e.target.value);
                if (!Number.isNaN(val) && val !== Number(t.price)) {
                  await adminMenuApi.updateTopping(t.id, { price: val });
                  showToast(`${t.name} price updated.`);
                  onChange();
                }
              }}
            />
            <button
              onClick={async () => {
                await adminMenuApi.updateTopping(t.id, { premium: !t.premium });
                onChange();
              }}
              className={`text-xs font-bold rounded-full px-3 py-1 ${t.premium ? "bg-amber-400/30 text-amber-700" : "bg-charcoal-100 text-charcoal-500"}`}
            >
              {t.premium ? "★ Premium" : "Standard"}
            </button>
            <button
              onClick={async () => {
                await adminMenuApi.updateTopping(t.id, { active: !t.active });
                onChange();
              }}
              className={`text-xs font-bold rounded-full px-3 py-1 ${t.active ? "bg-green-100 text-green-700" : "bg-charcoal-100 text-charcoal-500"}`}
            >
              {t.active ? "Active" : "Disabled"}
            </button>
            <button
              className="text-charcoal-400 hover:text-burgundy-600 text-xs"
              onClick={async () => {
                await adminMenuApi.deleteTopping(t.id);
                showToast("Topping removed.");
                onChange();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DealsTab({ deals, onChange }: { deals: Deal[]; onChange: () => void }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  async function addDeal() {
    if (!name || price === "") return;
    try {
      await adminMenuApi.createDeal({ name, description, price: Number(price), sortOrder: deals.length });
      setName("");
      setDescription("");
      setPrice("");
      showToast("Deal created.");
      onChange();
    } catch {
      showToast("Couldn't create deal.", "error");
    }
  }

  return (
    <div className="bg-white rounded-xl2 shadow-card p-4">
      <div className="grid sm:grid-cols-4 gap-2 mb-4">
        <input className="input sm:col-span-1" placeholder="Deal name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input sm:col-span-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="input" type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <button className="btn-primary !py-2 !px-4 text-sm mb-4" onClick={addDeal}>+ Add Deal</button>
      <ul className="divide-y divide-charcoal-50">
        {deals.map((d) => (
          <li key={d.id} className="flex items-center justify-between py-3 gap-3">
            <div className="flex-1">
              <div className="font-semibold text-sm">{d.name}</div>
              <div className="text-xs text-charcoal-400">{d.description}</div>
            </div>
            <span className="font-semibold text-sm">${Number(d.price).toFixed(2)}</span>
            <button
              onClick={async () => {
                await adminMenuApi.updateDeal(d.id, { active: !d.active });
                onChange();
              }}
              className={`text-xs font-bold rounded-full px-3 py-1 ${d.active ? "bg-green-100 text-green-700" : "bg-charcoal-100 text-charcoal-500"}`}
            >
              {d.active ? "Active" : "Disabled"}
            </button>
            <button
              className="text-charcoal-400 hover:text-burgundy-600 text-xs"
              onClick={async () => {
                await adminMenuApi.deleteDeal(d.id);
                showToast("Deal removed.");
                onChange();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
