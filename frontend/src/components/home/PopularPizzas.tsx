import { Link } from "react-router-dom";
import { useMenuData } from "../../context/MenuDataContext";
import { MenuItemCard } from "../MenuItemCard";
import { GridSkeleton } from "../LoadingSkeleton";
import { MenuItem } from "../../types";

// One featured item per category (in category order) so the homepage shows
// the breadth of the menu, not just pizzas.
function pickDiverseFeatured(categories: { menuItems: MenuItem[] }[], count: number): MenuItem[] {
  const picked: MenuItem[] = [];
  for (const cat of categories) {
    const item = cat.menuItems.find((m) => m.featured && !picked.some((p) => p.id === m.id));
    if (item) picked.push(item);
    if (picked.length >= count) break;
  }
  return picked;
}

export function PopularPizzas() {
  const { categories, loading } = useMenuData();
  const featured = pickDiverseFeatured(categories, 4);

  return (
    <section className="section py-16 sm:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-amber-600 font-semibold tracking-widest text-xs uppercase">From every corner of the menu</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">Fan Favorites</h2>
        </div>
        <Link to="/menu" className="text-burgundy-600 font-semibold text-sm hover:underline hidden sm:block">
          View full menu →
        </Link>
      </div>

      {loading ? (
        <GridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <Link to="/menu" className="btn-secondary w-full mt-8 sm:hidden">
        View Full Menu
      </Link>
    </section>
  );
}
