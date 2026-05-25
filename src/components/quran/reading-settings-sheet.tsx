"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Popover } from "@base-ui/react/popover";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useTranslationResources } from "@/hooks/use-translation-resources";
import { AVAILABLE_TAFASEER } from "@/data/available-tafaseer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SettingsIcon } from "@/components/icons";

interface ReadingSettingsProps {
  className?: string;
}

export function ReadingSettings({ className }: ReadingSettingsProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const triggerClassName =
    className ??
    "border-border hover:bg-surface-raised duration-fast ease-standard flex h-9 w-9 items-center justify-center rounded-lg border transition-colors";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Reading settings"
        className={triggerClassName}
      >
        <SettingsIcon size={16} />
      </button>
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="p-0">
            <SettingsContent onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      ) : (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Portal>
            <Popover.Positioner
              anchor={triggerRef}
              sideOffset={8}
              side="bottom"
              align="end"
              className="z-50"
            >
              <Popover.Popup
                initialFocus={false}
                className="border-border bg-background w-[min(420px,calc(100vw-1rem))] overflow-hidden rounded-2xl border shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
              >
                <SettingsContent onClose={() => setOpen(false)} />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </>
  );
}

function SettingsContent({ onClose }: { onClose: () => void }): React.JSX.Element {
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
    <div className="flex max-h-[min(70vh,640px)] flex-col">
      <div className="border-b border-[var(--text-alpha-06)] px-4 py-3">
        <h2 className="text-foreground text-sm font-semibold">Reading settings</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Adjust font size, translations, tafsir, and reading aids.
        </p>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-2">
          <label className="text-foreground flex items-center justify-between text-xs font-semibold">
            <span>Font size</span>
            <span className="text-muted-foreground font-normal tabular-nums">
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

        <section className="space-y-2">
          <h3 className="text-foreground text-xs font-semibold">Translation</h3>
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

        <section className="space-y-2">
          <h3 className="text-foreground text-xs font-semibold">Tafsir</h3>
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

        <section className="space-y-1">
          <h3 className="text-foreground text-xs font-semibold">Reading aids</h3>
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
      <div className="text-muted-foreground hidden border-t border-[var(--text-alpha-06)] px-4 py-2 text-[11px] sm:block">
        <button type="button" onClick={onClose} className="hover:text-foreground transition-colors">
          Close
        </button>
      </div>
    </div>
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

const MOBILE_QUERY = "(max-width: 639px)";

function subscribeMobile(callback: () => void): () => void {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMobileSnapshot(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
}
