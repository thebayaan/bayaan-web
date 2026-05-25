"use client";

import { MUSHAF_FONT_OPTIONS, normalizeMushafFontId } from "@/lib/mushaf-fonts";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { cn } from "@/lib/utils";

interface QuranFontPickerProps {
  className?: string;
}

export function QuranFontPicker({ className }: QuranFontPickerProps): React.JSX.Element {
  const quranFontId = useReadingSettingsStore((s) => s.quranFontId);
  const setQuranFontId = useReadingSettingsStore((s) => s.setQuranFontId);

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-foreground block text-sm font-semibold" htmlFor="quran-font">
        Quran font
      </label>
      <select
        id="quran-font"
        value={quranFontId}
        onChange={(event) => setQuranFontId(normalizeMushafFontId(event.target.value))}
        className="border-border bg-surface-sunken w-full rounded-lg border px-3 py-2 text-sm"
        aria-label="Quran font"
      >
        {MUSHAF_FONT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {MUSHAF_FONT_OPTIONS.find((option) => option.id === quranFontId)?.description}
      </p>
    </div>
  );
}
