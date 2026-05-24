"use client";

import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useTranslationResources } from "@/hooks/use-translation-resources";
import { AVAILABLE_TAFASEER } from "@/data/available-tafaseer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReadingSettingsSheet({ open, onOpenChange }: Props): React.JSX.Element {
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const setFontSize = useReadingSettingsStore((s) => s.setFontSize);
  const translationIds = useReadingSettingsStore((s) => s.translationIds);
  const setTranslationIds = useReadingSettingsStore((s) => s.setTranslationIds);
  const tafsirId = useReadingSettingsStore((s) => s.tafsirId);
  const setTafsirId = useReadingSettingsStore((s) => s.setTafsirId);
  const showTransliteration = useReadingSettingsStore((s) => s.showTransliteration);
  const toggleTransliteration = useReadingSettingsStore((s) => s.toggleTransliteration);
  const showWordByWord = useReadingSettingsStore((s) => s.showWordByWord);
  const toggleWordByWord = useReadingSettingsStore((s) => s.toggleWordByWord);
  const showTajweed = useReadingSettingsStore((s) => s.showTajweed);
  const toggleTajweed = useReadingSettingsStore((s) => s.toggleTajweed);
  const { translations } = useTranslationResources();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface flex w-full max-w-md flex-col">
        <SheetHeader>
          <SheetTitle>Reading settings</SheetTitle>
          <SheetDescription>Adjust font size, translations, tafsir, and reading aids.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <section className="space-y-3">
            <label className="text-foreground block text-sm font-semibold">
              Font size
              <span className="text-muted-foreground ml-2 font-normal tabular-nums">
                {fontSize.toFixed(1)}rem
              </span>
            </label>
            <input
              type="range"
              min={0.8}
              max={3}
              step={0.1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
              aria-label="Arabic font size"
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold">Translation</h3>
            <select
              value={translationIds}
              onChange={(e) => setTranslationIds(e.target.value)}
              className="border-border bg-surface-sunken w-full rounded-lg border px-3 py-2 text-sm"
              aria-label="Translation"
            >
              {translations.map((translation) => (
                <option key={translation.id} value={String(translation.id)}>
                  {translation.author_name} — {translation.name}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold">Tafsir</h3>
            <select
              value={tafsirId}
              onChange={(e) => setTafsirId(e.target.value)}
              className="border-border bg-surface-sunken w-full rounded-lg border px-3 py-2 text-sm"
              aria-label="Tafsir edition"
            >
              {AVAILABLE_TAFASEER.map((edition) => (
                <option key={edition.id} value={edition.id}>
                  {edition.name} ({edition.language})
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-2">
            <h3 className="text-foreground text-sm font-semibold">Reading aids</h3>
            <ToggleRow
              label="Transliteration"
              description="Show the verse in Latin script."
              checked={showTransliteration}
              onChange={toggleTransliteration}
            />
            <ToggleRow
              label="Word-by-word"
              description="Show meaning under each word."
              checked={showWordByWord}
              onChange={toggleWordByWord}
            />
            <ToggleRow
              label="Tajweed coloring"
              description="Color-code recitation rules."
              checked={showTajweed}
              onChange={toggleTajweed}
            />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onChange}
      className="hover:bg-surface-sunken flex w-full items-start justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-foreground text-sm font-semibold">{label}</span>
        <span className="text-muted-foreground text-xs">{description}</span>
      </span>
      <span
        aria-checked={checked}
        role="switch"
        className={`relative mt-1 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-main" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
