import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.3,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    (window as any).__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).__lenis = null;
    };
  }, []);

  // Reset scroll to the top on every route change (Lenis manages scroll, so
  // a plain window.scrollTo isn't enough once it's driving the frame loop).
  useEffect(() => {
    (window as any).__lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
