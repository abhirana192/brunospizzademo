import { useEffect, useRef, useState } from "react";
import { usePageTransition } from "../../context/PageTransitionContext";

const FADE_IN_SECONDS = 0.35;
const FADE_OUT_SECONDS = 1;

// Full-screen video-backed hero for the Home route. Menu is a normal,
// separately-scrollable page (see MenuPage) - this only ever renders the
// Home headline. Getting to Menu is deliberately click-only (nav bar or the
// Order Now button) - scrolling/swiping over the hero does nothing. The fade
// itself is handled by PageTransitionProvider (see PublicLayout), the same
// mechanism every other nav-triggered navigation uses.
export function CinematicShell() {
  const { navigateWithFade } = usePageTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let rafId: number;

    function tick() {
      const { currentTime, duration } = video!;
      if (duration && isFinite(duration)) {
        let opacity = 1;
        if (currentTime < FADE_IN_SECONDS) {
          opacity = currentTime / FADE_IN_SECONDS;
        } else if (currentTime > duration - FADE_OUT_SECONDS) {
          opacity = (duration - currentTime) / FADE_OUT_SECONDS;
        }
        setVideoOpacity(Math.max(0, Math.min(1, opacity)));
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="relative flex-1 min-h-0 w-full bg-charcoal-950 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/images/food/hero-pizza.jpg"
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        style={{ opacity: videoOpacity }}
      >
        <source src="/videos/pizza-making.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/70 via-charcoal-950/10 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="pl-4 sm:pl-6 lg:pl-8 pr-6 max-w-lg">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.05] tracking-tight drop-shadow-lg">
            <span className="inline-block animate-popSeq1">HOT.</span>{" "}
            <span className="inline-block animate-popSeq2">FRESH.</span>
            <br />
            <span className="inline-block animate-popSeq3Jitter text-amber-400">BRUNO'S.</span>
          </h1>
          <p className="text-white/90 text-base sm:text-lg mt-9 animate-fadeUp" style={{ animationDelay: "160ms" }}>
            Hand-stretched dough, slow-simmered sauces, time-honored recipes — crafted nightly for those who crave
            something real.
          </p>
          <div className="mt-12 animate-fadeUp" style={{ animationDelay: "240ms" }}>
            <button onClick={() => navigateWithFade("/menu")} className="btn-primary text-base py-3.5 px-8">
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
