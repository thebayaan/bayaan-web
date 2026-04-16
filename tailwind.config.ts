import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        "surah-names": ["var(--font-surah-names)"],
      },
      transitionDuration: {
        fast: "160ms",
        moderate: "200ms",
        regular: "400ms",
        slow: "600ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "heart-pulse": "heart-pulse 400ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
