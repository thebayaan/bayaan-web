"use client";

import { useThemeStore } from "@/stores/theme-store";
import { SettingsShell } from "@/components/settings/settings-shell";

type ThemeMode = "light" | "dark" | "system";

const MODES: ThemeMode[] = ["light", "dark", "system"];

export default function AppearanceSettingsPage() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

  return (
    <SettingsShell title="Appearance" description="Choose how Bayaan looks.">
      <div
        role="radiogroup"
        aria-label="Theme mode"
        className="flex gap-2"
        data-testid="theme-mode-group"
      >
        {MODES.map((mode) => (
          <button
            key={mode}
            role="radio"
            aria-checked={themeMode === mode}
            onClick={() => setThemeMode(mode)}
            className={`rounded-lg px-4 py-2 text-sm capitalize transition-colors ${
              themeMode === mode
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground bg-[var(--text-alpha-06)]"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </SettingsShell>
  );
}
