"use client";

import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { LIGHT_READING_THEMES, DARK_READING_THEMES } from "@/data/reading-themes";
import { SettingsShell } from "@/components/settings/settings-shell";
import type { ReadingTheme } from "@/types/quran";

function ThemeSwatch({
  theme,
  selected,
  onSelect,
}: {
  theme: ReadingTheme;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${theme.name} theme`}
      className={`rounded-lg border p-3 transition-colors ${
        selected ? "border-foreground" : "border-transparent hover:border-[var(--text-alpha-10)]"
      }`}
      style={{ backgroundColor: theme.colors.background }}
    >
      <div
        className="h-4 w-full rounded"
        style={{ backgroundColor: theme.colors.text, opacity: 0.2 }}
      />
      <p className="mt-1 text-[10px]" style={{ color: theme.colors.text }}>
        {theme.name}
      </p>
    </button>
  );
}

export default function ReadingThemesSettingsPage() {
  const lightThemeId = useReadingSettingsStore((s) => s.lightThemeId);
  const darkThemeId = useReadingSettingsStore((s) => s.darkThemeId);
  const setLightTheme = useReadingSettingsStore((s) => s.setLightTheme);
  const setDarkTheme = useReadingSettingsStore((s) => s.setDarkTheme);

  return (
    <SettingsShell
      title="Reading Themes"
      description="Mushaf page colors. Picked per light and dark mode."
    >
      <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
        Light
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {LIGHT_READING_THEMES.map((theme) => (
          <ThemeSwatch
            key={theme.id}
            theme={theme}
            selected={lightThemeId === theme.id}
            onSelect={() => setLightTheme(theme.id)}
          />
        ))}
      </div>

      <h2 className="text-muted-foreground mt-6 mb-2 text-xs font-medium tracking-wider uppercase">
        Dark
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {DARK_READING_THEMES.map((theme) => (
          <ThemeSwatch
            key={theme.id}
            theme={theme}
            selected={darkThemeId === theme.id}
            onSelect={() => setDarkTheme(theme.id)}
          />
        ))}
      </div>
    </SettingsShell>
  );
}
