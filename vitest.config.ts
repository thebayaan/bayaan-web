import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: { url: "http://localhost:3000" },
    },
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    globals: true,
    css: false,
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        "src/__tests__/**",
        "src/types/**",
        "src/data/**",
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/app/**/opengraph-image.tsx",
        "src/app/**/sitemap.ts",
        "src/app/**/robots.ts",
      ],
      // Floor set ~2pp below current measured coverage on main
      // (60.14 / 52.37 / 60.55 / 61.15 as of the latest CI run).
      // Ratchet up over time as new tests land; do not lower without
      // team discussion.
      thresholds: {
        statements: 58,
        branches: 50,
        functions: 58,
        lines: 58,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
