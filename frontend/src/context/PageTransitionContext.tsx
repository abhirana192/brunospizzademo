import { createContext, MouseEvent, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FADE_MS = 380;

interface PageTransitionContextValue {
  exiting: boolean;
  navigateWithFade: (path: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

// Every nav-bar/footer/CTA navigation between top-level pages goes through
// this, so they all share the same "fade the current page out fully, then
// switch" motion (the same one already used for Home's Order Now button) -
// never a cross-fade, which is what keeps the plain page background from
// ever being exposed mid-transition.
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [exiting, setExiting] = useState(false);
  const lockRef = useRef(false);

  // The lock/exiting state is scoped to one transition - once the route has
  // actually changed, reset so the next navigation starts clean.
  useEffect(() => {
    setExiting(false);
    lockRef.current = false;
  }, [location.pathname]);

  function navigateWithFade(path: string) {
    if (lockRef.current || path === location.pathname) return;
    lockRef.current = true;
    setExiting(true);
    setTimeout(() => navigate(path), FADE_MS);
  }

  return <PageTransitionContext.Provider value={{ exiting, navigateWithFade }}>{children}</PageTransitionContext.Provider>;
}

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error("usePageTransition must be used within PageTransitionProvider");
  return ctx;
}

// A plain left-click (no modifier keys) is the only case that should be
// hijacked into a faded navigation - ctrl/cmd/shift/middle-click all mean
// "open in a new tab/window", which must keep working normally.
export function isPlainLeftClick(e: MouseEvent) {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
