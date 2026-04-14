"use client";

import { useThemeStore } from "@/stores/theme-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import {
  LIGHT_READING_THEMES,
  DARK_READING_THEMES,
} from "@/data/reading-themes";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsPage() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const readingSettings = useReadingSettingsStore();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Theme */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Appearance</h2>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                themeMode === mode
                  ? "bg-foreground text-background font-medium"
                  : "bg-[var(--text-alpha-06)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      {/* Reading Settings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Reading</h2>
        <div className="space-y-4">
          {/* Font Size */}
          <div className="flex items-center justify-between">
            <label className="text-sm">Arabic Font Size</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  readingSettings.setFontSize(
                    Math.max(1.2, readingSettings.fontSize - 0.2),
                  )
                }
                className="w-8 h-8 rounded-lg bg-[var(--text-alpha-06)] flex items-center justify-center text-sm"
              >
                A-
              </button>
              <span className="text-sm w-12 text-center">
                {readingSettings.fontSize.toFixed(1)}
              </span>
              <button
                onClick={() =>
                  readingSettings.setFontSize(
                    Math.min(3.0, readingSettings.fontSize + 0.2),
                  )
                }
                className="w-8 h-8 rounded-lg bg-[var(--text-alpha-06)] flex items-center justify-center text-sm"
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
        <h2 className="text-lg font-semibold mb-3">Reading Theme</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {LIGHT_READING_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => readingSettings.setLightTheme(theme.id)}
              className={`rounded-lg p-3 border transition-colors ${
                readingSettings.lightThemeId === theme.id
                  ? "border-foreground"
                  : "border-transparent hover:border-[var(--text-alpha-10)]"
              }`}
              style={{ backgroundColor: theme.colors.background }}
            >
              <div
                className="w-full h-4 rounded"
                style={{ backgroundColor: theme.colors.text, opacity: 0.2 }}
              />
              <p
                className="text-[10px] mt-1"
                style={{ color: theme.colors.text }}
              >
                {theme.name}
              </p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Dark themes</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
          {DARK_READING_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => readingSettings.setDarkTheme(theme.id)}
              className={`rounded-lg p-3 border transition-colors ${
                readingSettings.darkThemeId === theme.id
                  ? "border-foreground"
                  : "border-transparent hover:border-[var(--text-alpha-10)]"
              }`}
              style={{ backgroundColor: theme.colors.background }}
            >
              <div
                className="w-full h-4 rounded"
                style={{ backgroundColor: theme.colors.text, opacity: 0.2 }}
              />
              <p
                className="text-[10px] mt-1"
                style={{ color: theme.colors.text }}
              >
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
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-[var(--text-alpha-10)]"
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}
