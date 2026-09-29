import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "burgundy" class names kept for minimal churn, but the hues are now
        // a bright, fresh red-orange (primary brand accent).
        burgundy: {
          50: "#fff1ee",
          100: "#ffe0d8",
          200: "#ffbdac",
          300: "#ff9271",
          400: "#fb6a41",
          500: "#f14a24",
          600: "#e6301a", // primary brand red
          700: "#c22314",
          800: "#971b10",
          900: "#6e140c",
        },
        // Warm cream, used as the page background (never stark white).
        cream: {
          50: "#fffaf3",
          100: "#fdf3e7",
          200: "#faead4",
          300: "#f2d9b8",
          400: "#e4bd8c",
        },
        charcoal: {
          50: "#f7f5f2",
          100: "#e8e4de",
          200: "#cec7bd",
          300: "#a39a8d",
          400: "#7c7266",
          500: "#5c5346",
          600: "#453e34",
          700: "#332d26",
          800: "#221e19",
          900: "#17140f",
          950: "#0e0c09",
        },
        // Bold yellow, used as the tertiary accent (badges, highlights).
        amber: {
          50: "#fffbea",
          100: "#fff3c4",
          200: "#fce588",
          300: "#fad35f",
          400: "#ffc72c", // primary yellow accent
          500: "#f2b705",
          600: "#c99500",
          700: "#a17800",
        },
      },
      backgroundImage: {
        flame: "linear-gradient(135deg, #e6301a 0%, #f14a24 45%, #fb8c1a 100%)",
        gold: "linear-gradient(135deg, #ffc72c 0%, #fb8c1a 100%)",
        sheen: "linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 60%)",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(110, 50, 20, 0.18)",
        pop: "0 20px 45px -15px rgba(110, 50, 20, 0.3)",
        glow: "0 10px 28px -6px rgba(230, 48, 26, 0.45)",
        premium: "0 30px 70px -25px rgba(23, 20, 15, 0.4)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "2rem",
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
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "55%": { opacity: "1", transform: "scale(1.18)" },
          "75%": { transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        popSeq1: {
          "0%, 100%": { transform: "scale(1)" },
          "4%": { transform: "scale(1.18)" },
          "8%": { transform: "scale(0.94)" },
          "12%": { transform: "scale(1)" },
        },
        popSeq2: {
          "0%, 18%, 100%": { transform: "scale(1)" },
          "22%": { transform: "scale(1.18)" },
          "26%": { transform: "scale(0.94)" },
          "30%": { transform: "scale(1)" },
        },
        popSeq3Jitter: {
          "0%, 36%, 100%": { transform: "scale(1) rotate(0deg)" },
          "40%": { transform: "scale(1.03) rotate(-8deg)" },
          "43%": { transform: "scale(1.03) rotate(8deg)" },
          "46%": { transform: "scale(1.03) rotate(-6deg)" },
          "49%": { transform: "scale(1.03) rotate(4deg)" },
          "52%": { transform: "scale(1.04) rotate(0deg)" },
          "58%": { transform: "scale(1.2) rotate(0deg)" },
          "62%": { transform: "scale(0.94) rotate(0deg)" },
          "66%": { transform: "scale(1) rotate(0deg)" },
        },
        pizzaChase: {
          "0%": { opacity: "0", transform: "translateX(-2.75rem) rotate(-20deg)" },
          "8%": { opacity: "1" },
          "38%": { opacity: "1", transform: "translateX(1.6rem) rotate(12deg)" },
          "44%": { opacity: "1", transform: "translateX(2.3rem) scale(1.35) rotate(0deg)" },
          "50%, 100%": { opacity: "0", transform: "translateX(2.3rem) scale(0)" },
        },
        orderTextChase: {
          "0%, 46%": { opacity: "0", transform: "scale(0.7)" },
          "54%": { opacity: "1", transform: "scale(1.1)" },
          "60%, 88%": { opacity: "1", transform: "scale(1)" },
          "94%, 100%": { opacity: "0", transform: "scale(0.85)" },
        },
        pageEnterUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pageEnterDown: {
          "0%": { opacity: "0", transform: "translateY(-28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        cardDealDown: {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        cardDealUp: {
          "0%": { opacity: "0", transform: "translateY(-18px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        cardExitUp: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-16px) scale(0.97)" },
        },
        cardExitDown: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(16px) scale(0.97)" },
        },
        cardFadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        cardFadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        floatSlow: "floatSlow 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
        steam: "steam 3s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        popIn: "popIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        popSeq1: "popSeq1 6.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite",
        popSeq2: "popSeq2 6.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite",
        popSeq3Jitter: "popSeq3Jitter 6.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite",
        pizzaChase: "pizzaChase 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        orderTextChase: "orderTextChase 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        pageEnterUp: "pageEnterUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        pageEnterDown: "pageEnterDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        cardDealDown: "cardDealDown 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        cardDealUp: "cardDealUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        cardExitUp: "cardExitUp 0.4s cubic-bezier(0.45, 0, 0.55, 1) both",
        cardExitDown: "cardExitDown 0.4s cubic-bezier(0.45, 0, 0.55, 1) both",
        cardFadeIn: "cardFadeIn 0.3s ease-out both",
        cardFadeOut: "cardFadeOut 0.22s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
