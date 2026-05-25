"use client";

import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { supportsTajweedColoring } from "@/lib/mushaf-fonts";
import { SettingsShell } from "@/components/settings/settings-shell";
import { SettingToggle } from "@/components/settings/setting-toggle";
import { QuranFontPicker } from "@/components/quran/quran-font-picker";

const MIN_FONT = 1.2;
const MAX_FONT = 3.0;
const FONT_STEP = 0.2;

export default function ReadingSettingsPage() {
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const setFontSize = useReadingSettingsStore((s) => s.setFontSize);
  const showTransliteration = useReadingSettingsStore((s) => s.showTransliteration);
  const showWordByWord = useReadingSettingsStore((s) => s.showWordByWord);
  const showTajweed = useReadingSettingsStore((s) => s.showTajweed);
  const quranFontId = useReadingSettingsStore((s) => s.quranFontId);
  const toggleTransliteration = useReadingSettingsStore((s) => s.toggleTransliteration);
  const toggleWordByWord = useReadingSettingsStore((s) => s.toggleWordByWord);
  const toggleTajweed = useReadingSettingsStore((s) => s.toggleTajweed);
  const showTajweedToggle = supportsTajweedColoring(quranFontId);

  return (
    <SettingsShell title="Reading" description="Controls that affect the Mushaf and verse display.">
      <div className="space-y-4">
        <QuranFontPicker />

        <div className="flex items-center justify-between">
          <label className="text-sm" htmlFor="font-size">
            Arabic Font Size
          </label>
          <div className="flex items-center gap-2" id="font-size">
            <button
              onClick={() => setFontSize(Math.max(MIN_FONT, fontSize - FONT_STEP))}
              aria-label="Decrease font size"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm"
            >
              A-
            </button>
            <span className="w-12 text-center text-sm" aria-live="polite">
              {fontSize.toFixed(1)}
            </span>
            <button
              onClick={() => setFontSize(Math.min(MAX_FONT, fontSize + FONT_STEP))}
              aria-label="Increase font size"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm"
            >
              A+
            </button>
          </div>
        </div>

        <SettingToggle
          label="Show Transliteration"
          checked={showTransliteration}
          onChange={toggleTransliteration}
        />
        <SettingToggle label="Word-by-Word" checked={showWordByWord} onChange={toggleWordByWord} />
        {showTajweedToggle ? (
          <SettingToggle label="Tajweed Colors" checked={showTajweed} onChange={toggleTajweed} />
        ) : null}
      </div>
    </SettingsShell>
  );
}
