"use client";

import { useEffect } from "react";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    const resolved = getResolvedTheme(themeMode);
    document.documentElement.classList.toggle("dark", resolved === "dark");

    if (themeMode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      function handleChange() {
        const systemTheme = mq.matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      }
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  return <>{children}</>;
}
