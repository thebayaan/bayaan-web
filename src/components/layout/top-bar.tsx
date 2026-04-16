"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useThemeStore, type ThemeMode } from "@/stores/theme-store";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { SearchIcon } from "@/components/icons";

const THEME_ORDER: ThemeMode[] = ["light", "dark", "sepia", "system"];

export function TopBar() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const openPalette = useCommandPaletteStore((s) => s.setOpen);

  function cycleTheme() {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(themeMode) + 1) % THEME_ORDER.length];
    if (next === undefined) return;
    setThemeMode(next);
  }

  return (
    <header className="border-border-divider bg-surface/90 sticky top-0 z-30 hidden items-center gap-4 border-b px-6 py-3 backdrop-blur-md md:flex">
      <button
        type="button"
        onClick={() => openPalette(true)}
        className="border-border bg-surface-sunken hover:bg-surface-raised duration-fast ease-standard flex max-w-xl flex-1 items-center gap-3 rounded-full border px-4 py-2 text-sm transition-colors"
      >
        <SearchIcon size={16} />
        <span className="text-muted-foreground flex-1 text-left">
          Search surahs, reciters, verses…
        </span>
        <span className="border-border text-muted-foreground hidden rounded border px-1.5 py-0.5 text-[11px] font-semibold md:inline">
          ⌘K
        </span>
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Cycle theme (currently ${themeMode})`}
        className="border-border hover:bg-surface-raised duration-fast ease-standard flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
      >
        <ThemeGlyph mode={themeMode} />
      </button>
      <div className="bg-border-divider mx-1 h-6 w-px" />
      <UserChip />
    </header>
  );
}

function UserChip() {
  const { user, isSignedIn } = useUser();
  if (!isSignedIn || !user) {
    return (
      <Link
        href="/sign-in"
        className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong duration-fast ease-standard rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
      >
        Sign in
      </Link>
    );
  }
  const displayName =
    user.firstName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? "Account";
  return (
    <div className="border-border bg-surface-raised flex items-center gap-2 rounded-full border py-1 pr-3 pl-1">
      <UserButton
        appearance={{
          elements: { avatarBox: "w-7 h-7" },
        }}
      />
      <span className="text-foreground hidden text-sm font-semibold md:inline">{displayName}</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function ThemeGlyph({ mode }: { mode: ThemeMode }) {
  if (mode === "dark") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (mode === "sepia") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  if (mode === "system") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
