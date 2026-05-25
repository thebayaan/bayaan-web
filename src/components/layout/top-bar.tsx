"use client";

import Link from "next/link";
import { useThemeStore, type ThemeMode, getResolvedTheme } from "@/stores/theme-store";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import {
  AutoThemeIcon,
  LogoIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  TafseerIcon,
} from "@/components/icons";

const THEME_ORDER: ThemeMode[] = ["light", "dark", "sepia", "system"];

export function TopBar() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const openPalette = useCommandPaletteStore((s) => s.setOpen);
  const isDark = getResolvedTheme(themeMode) === "dark";

  function cycleTheme() {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(themeMode) + 1) % THEME_ORDER.length];
    if (next === undefined) return;
    setThemeMode(next);
  }

  return (
    <header className="border-border-divider bg-surface/90 sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md md:gap-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 pr-1 md:pr-2" aria-label="Bayaan home">
        <LogoIcon size={26} isDarkMode={isDark} />
        <span className="text-foreground hidden text-[17px] font-bold tracking-tight lg:inline">
          Bayaan
        </span>
      </Link>
      <button
        type="button"
        onClick={() => openPalette(true)}
        className="border-border bg-surface-sunken hover:bg-surface-raised duration-fast ease-standard flex max-w-xl flex-1 items-center gap-3 rounded-full border px-3 py-2 text-sm transition-colors md:px-4"
      >
        <SearchIcon size={16} />
        <span className="text-muted-foreground flex-1 truncate text-left">
          <span className="hidden md:inline">Search surahs, reciters, verses…</span>
          <span className="md:hidden">Search…</span>
        </span>
        <span className="border-border text-muted-foreground hidden rounded border px-1.5 py-0.5 text-[11px] font-semibold md:inline">
          ⌘K
        </span>
      </button>
      <div className="hidden flex-1 md:block" />
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Cycle theme (currently ${themeMode})`}
        className="border-border hover:bg-surface-raised duration-fast ease-standard flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
      >
        <ThemeGlyph mode={themeMode} />
      </button>
    </header>
  );
}

function ThemeGlyph({ mode }: { mode: ThemeMode }) {
  if (mode === "dark") return <MoonIcon size={16} />;
  if (mode === "sepia") return <TafseerIcon size={16} />;
  if (mode === "system") return <AutoThemeIcon size={16} />;
  return <SunIcon size={16} />;
}
