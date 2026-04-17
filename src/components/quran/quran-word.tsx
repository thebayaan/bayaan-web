"use client";
import type { QcfWord } from "@/types/quran-api";
import { cn } from "@/lib/utils";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { useHighlights, HIGHLIGHT_SWATCH } from "@/hooks/use-highlights";

interface QuranWordProps {
  word: QcfWord;
  isFontLoaded: boolean;
  fontFamily: string;
  className?: string;
  /**
   * When true, clicking the word selects its verse (enables the mushaf
   * floating action bar). Leave false in contexts like the reading view
   * where per-verse controls live elsewhere.
   */
  selectable?: boolean;
}

export function QuranWord({
  word,
  isFontLoaded,
  fontFamily,
  className,
  selectable = false,
}: QuranWordProps) {
  const text = isFontLoaded ? word.code_v2 : word.qpc_uthmani_hafs;
  const toggle = useVerseSelectionStore((s) => s.toggle);
  const selectedVerseKey = useVerseSelectionStore((s) => s.selectedVerseKey);
  const isSelected = selectable && selectedVerseKey === word.verse_key;
  const { getHighlight } = useHighlights();
  const highlight = selectable ? getHighlight(word.verse_key) : undefined;

  return (
    <span
      className={cn(
        "inline-block cursor-pointer transition-colors hover:text-blue-400/80",
        !isFontLoaded && "font-[UthmanicHafs]",
        isSelected && "rounded bg-[var(--text-alpha-10)]",
        className,
      )}
      style={{
        ...(isFontLoaded ? { fontFamily } : undefined),
        ...(highlight
          ? {
              backgroundColor: `${HIGHLIGHT_SWATCH[highlight.color]}66`,
              borderRadius: "0.25rem",
            }
          : undefined),
      }}
      data-verse-key={word.verse_key}
      data-word-position={word.position}
      onClick={
        selectable
          ? (e) => {
              e.stopPropagation();
              toggle(word.verse_key);
            }
          : undefined
      }
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(word.verse_key);
              }
            }
          : undefined
      }
    >
      {text}
    </span>
  );
}
