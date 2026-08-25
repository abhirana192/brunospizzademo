import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: "#fbeceb",
          100: "#f3d0cd",
          200: "#e5a29c",
          300: "#d16f65",
          400: "#b4443a",
          500: "#8f2a20",
          600: "#7a1f13", // primary brand
          700: "#63180e",
          800: "#4a120a",
          900: "#320c07",
        },
        cream: {
          50: "#fffdfa",
          100: "#fdf8f3",
          200: "#fbf0e4",
          300: "#f5e2cc",
          400: "#ecd0ac",
        },
        charcoal: {
          50: "#f2f2f1",
          100: "#dcdbd9",
          300: "#8a8886",
          500: "#4a4846",
          700: "#2e2c2a",
          800: "#211f1e",
          900: "#161514",
        },
        amber: {
          400: "#f0a83c",
          500: "#e6912b",
          600: "#c97418",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(30, 15, 10, 0.25)",
        pop: "0 20px 45px -15px rgba(30, 15, 10, 0.4)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-14px) rotate(2deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        steam: {
          "0%": { opacity: "0", transform: "translateY(0) scaleX(1)" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "0", transform: "translateY(-30px) scaleX(1.4)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        floatSlow: "floatSlow 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
        steam: "steam 3s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
