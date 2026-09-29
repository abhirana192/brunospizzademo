import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMenuData } from "../context/MenuDataContext";
import { MenuItemCard } from "../components/MenuItemCard";
import { PageHero } from "../components/PageHero";

const CATEGORY_ICONS: Record<string, string> = {
  pizzas: "🍕",
  snacks: "🍗",
  salads: "🥗",
  "hot-sandwiches": "🥪",
  others: "🍽️",
  "chinese-menu": "🥡",
  drinks: "🥤",
  desserts: "🍰",
};

export function MenuPage() {
  const { categories, loading, error } = useMenuData();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Highlights the tab for whichever category section is currently in view,
  // not just the last one clicked. Deliberately not IntersectionObserver-
  // based: with categories this size-mismatched (some have 3 items, Snacks
  // alone runs ~7000px tall), a narrow overlap band picks up the *tail end*
  // of a tall preceding section clipping into it right as a short section's
  // top passes through, and gets stuck on the wrong tab. Walking sections in
  // order and taking the last one whose top has already crossed the
  // reference line is immune to that - it only cares about top position.
  useEffect(() => {
    if (loading || categories.length === 0) return;
    // Matches scroll-mt-36 (144px) - the sections' own CSS scroll-margin-top,
    // which is also what Lenis lands on when jumpTo scrolls to one of them.
    const REFERENCE_LINE = 150;

    function updateActiveFromScroll() {
      let current: string | null = null;
      for (const c of categories) {
        const el = document.getElementById(`cat-${c.slug}`);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= REFERENCE_LINE) {
          current = c.slug;
        } else {
          break;
        }
      }
      if (current) setActiveSlug(current);
    }

    updateActiveFromScroll();

    // Lenis drives scroll position itself and doesn't reliably dispatch a
    // native "scroll" event for every change (in particular, immediate/
    // instant jumps don't) - its own "scroll" event is the one guaranteed to
    // fire for every scroll it produces, so that's what this listens to
    // instead of window's native event. Falls back to native scroll if
    // Lenis isn't ready yet for some reason.
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.on("scroll", updateActiveFromScroll);
      return () => lenis.off("scroll", updateActiveFromScroll);
    }
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveFromScroll);
  }, [loading, categories]);

  function jumpTo(slug: string) {
    setActiveSlug(slug);
    const lenis = (window as any).__lenis;
    const target = document.getElementById(`cat-${slug}`);
    if (!target) return;
    // No manual offset here - Lenis already reads each section's CSS
    // scroll-margin-top (scroll-mt-36, i.e. the sticky header + tab bar's
    // combined height) and lands correctly on its own. Adding an offset on
    // top of that double-counts it and overshoots past the target.
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const displayActiveSlug = activeSlug ?? categories[0]?.slug ?? null;

  return (
    <div className="bg-charcoal-950">
      <Helmet>
        <title>Menu — Bruno's Deli &amp; Pizza</title>
        <meta name="description" content="Browse the full Bruno's Deli & Pizza menu: handcrafted pizza, snacks, salads, hot sandwiches, Chinese food, and more." />
      </Helmet>

      <PageHero
        eyebrow="Order Online"
        title="Our Menu"
        subtitle="Handcrafted pizza, a full Chinese kitchen, and diner classics — pick a category or just scroll through it all."
        image="/images/food/hero-pizza.jpg"
      />

      <div className="sticky top-20 z-20 bg-charcoal-950/90 backdrop-blur-md border-b border-white/10">
        <div className="section py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {(loading ? Array.from({ length: 6 }) : categories).map((c: any, i) => (
            <button
              key={c?.id ?? i}
              type="button"
              disabled={loading}
              onClick={() => jumpTo(c.slug)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition border shrink-0 ${
                displayActiveSlug === c?.slug
                  ? "bg-amber-400 text-charcoal-900 border-amber-400"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
              } ${loading ? "opacity-30" : ""}`}
            >
              {c && <span aria-hidden>{CATEGORY_ICONS[c.slug] ?? ""}</span>}
              {c?.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section py-12 sm:py-16">
        {error && <p className="text-center text-white/60 py-16">{error}</p>}

        {!error && loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl2 bg-white/5 border border-white/10 h-72 animate-pulse" />
            ))}
          </div>
        )}

        {!error &&
          !loading &&
          categories.map((c) => (
            <section key={c.id} id={`cat-${c.slug}`} className="scroll-mt-36 mb-16 last:mb-0">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl" aria-hidden>
                  {CATEGORY_ICONS[c.slug] ?? "🍽️"}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream-50">{c.name}</h2>
              </div>

              {c.menuItems.length === 0 ? (
                <p className="text-white/40 text-sm">No items in this category right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {c.menuItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} transparent />
                  ))}
                </div>
              )}
            </section>
          ))}
      </div>
    </div>
  );
}
