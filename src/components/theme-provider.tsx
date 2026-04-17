"use client";

import { useEffect } from "react";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", getResolvedTheme(themeMode));
    root.classList.remove("dark");

    if (themeMode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      root.setAttribute("data-theme", mq.matches ? "dark" : "light");
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [themeMode]);

  return <>{children}</>;
}
