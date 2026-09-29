import { useState } from "react";

export function FoodImage({ image, name, className }: { image: string | null; name: string; className?: string }) {
  const [errored, setErrored] = useState(false);

  if (!image || errored) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-cream-300 to-cream-400 ${className ?? ""}`}>
        <svg width="34%" height="34%" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-30 text-charcoal-700">
          <path
            d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8M4 12h16M4 12l1.5 7h13L20 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
