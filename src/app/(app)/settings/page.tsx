"use client";

import { useThemeStore } from "@/stores/theme-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { LIGHT_READING_THEMES, DARK_READING_THEMES } from "@/data/reading-themes";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsPage() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const readingSettings = useReadingSettingsStore();

  return (
    <div className="max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      {/* Theme */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Appearance</h2>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
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
      </section>

      {/* Reading Settings */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Reading</h2>
        <div className="space-y-4">
          {/* Font Size */}
          <div className="flex items-center justify-between">
            <label className="text-sm">Arabic Font Size</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  readingSettings.setFontSize(Math.max(1.2, readingSettings.fontSize - 0.2))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm"
              >
                A-
              </button>
              <span className="w-12 text-center text-sm">
                {readingSettings.fontSize.toFixed(1)}
              </span>
              <button
                onClick={() =>
                  readingSettings.setFontSize(Math.min(3.0, readingSettings.fontSize + 0.2))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm"
              >
                A+
              </button>
            </div>
          </div>

          {/* Toggles */}
          <SettingToggle
            label="Show Transliteration"
            checked={readingSettings.showTransliteration}
            onChange={readingSettings.toggleTransliteration}
          />
          <SettingToggle
            label="Word-by-Word"
            checked={readingSettings.showWordByWord}
            onChange={readingSettings.toggleWordByWord}
          />
          <SettingToggle
            label="Tajweed Colors"
            checked={readingSettings.showTajweed}
            onChange={readingSettings.toggleTajweed}
          />
        </div>
      </section>

      {/* Reading Theme */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Reading Theme</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {LIGHT_READING_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => readingSettings.setLightTheme(theme.id)}
              className={`rounded-lg border p-3 transition-colors ${
                readingSettings.lightThemeId === theme.id
                  ? "border-foreground"
                  : "border-transparent hover:border-[var(--text-alpha-10)]"
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
          ))}
        </div>
        <p className="text-muted-foreground mt-2 text-xs">Dark themes</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {DARK_READING_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => readingSettings.setDarkTheme(theme.id)}
              className={`rounded-lg border p-3 transition-colors ${
                readingSettings.darkThemeId === theme.id
                  ? "border-foreground"
                  : "border-transparent hover:border-[var(--text-alpha-10)]"
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
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm">{label}</label>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-10 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-[var(--text-alpha-10)]"
        }`}
      >
        <div
          className={`bg-background absolute top-1 left-1 h-4 w-4 rounded-full transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}
