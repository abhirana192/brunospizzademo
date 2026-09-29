import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickyCartBar } from "./StickyCartBar";
import { CinematicShell } from "./home/CinematicShell";
import { PageTransitionProvider, usePageTransition } from "../context/PageTransitionContext";

// Pages using the dark-glass theme - matches Header's own list. The wrapper
// needs this too: while a page is fading out (see PageTransitionContext),
// its opacity drops to 0 and whatever sits behind it shows through. Without
// an explicit dark background here, that "behind it" is the plain cream
// <body>, which is exactly the white flash a fade-out shouldn't have.
const DARK_PAGES = ["/", "/menu", "/about", "/contact", "/account"];

// Home has a persistent video-backed hero shell (mounted here, above the
// route Outlet) that fills the screen with no real page scroll. Every other
// page, including Menu, is a normal scrollable page.
export function PublicLayout() {
  const { pathname } = useLocation();
  const isCinematic = pathname === "/";
  const isDarkPage = DARK_PAGES.includes(pathname);

  useEffect(() => {
    if (!isCinematic) window.scrollTo(0, 0);
  }, [pathname, isCinematic]);

  return (
    <PageTransitionProvider>
      <div
        className={`${isCinematic ? "relative h-screen flex flex-col overflow-hidden" : "min-h-screen flex flex-col"} ${
          isDarkPage ? "bg-charcoal-950" : ""
        }`}
      >
        <Header />
        <PageFadeArea isCinematic={isCinematic} />
        <StickyCartBar />
      </div>
    </PageTransitionProvider>
  );
}

// Fades out fully before a nav-triggered route change lands (see
// PageTransitionContext) - wrapped separately from Header so the header
// itself never fades, only the page content below it.
function PageFadeArea({ isCinematic }: { isCinematic: boolean }) {
  const { exiting } = usePageTransition();

  return (
    <div
      className={`flex-1 min-h-0 flex flex-col transition-all duration-[380ms] ease-in ${
        exiting ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
      }`}
    >
      {isCinematic ? (
        <>
          <Outlet />
          <CinematicShell />
        </>
      ) : (
        <main className="flex-1">
          <Outlet />
        </main>
      )}
      {!isCinematic && <Footer />}
    </div>
  );
}
