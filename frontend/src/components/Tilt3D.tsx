import { ElementType, PointerEvent as ReactPointerEvent, ReactNode, useRef } from "react";

const FINE_POINTER = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;

export function Tilt3D<T extends ElementType = "div">({
  as,
  children,
  className = "",
  max = 8,
  scale = 1.02,
  glare = false,
  ...rest
}: {
  as?: T;
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">) {
  const Component = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function handleMove(e: ReactPointerEvent<HTMLElement>) {
    if (!FINE_POINTER) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * max * 2;
    const rotateX = (0.5 - py) * max * 2;
    el.style.transition = "transform 0s";
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.35), transparent 60%)`;
    }
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  }

  return (
    <Component
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative will-change-transform [transform-style:preserve-3d] ${className}`}
      {...rest}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        />
      )}
    </Component>
  );
}
