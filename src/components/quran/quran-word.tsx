"use client";
import { useCallback, useRef } from "react";
import type { QcfWord } from "@/types/quran-api";
import { cn } from "@/lib/utils";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { useHighlights, HIGHLIGHT_SWATCH } from "@/hooks/use-highlights";

interface QuranWordProps {
  word: QcfWord;
  isFontLoaded: boolean;
  fontFamily: string;
  className?: string;
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
  const ref = useRef<HTMLSpanElement | null>(null);

  const handleSelect = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    toggle(word.verse_key, {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });
  }, [toggle, word.verse_key]);

  return (
    <span
      ref={ref}
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
      onClick={selectable ? handleSelect : undefined}
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect();
              }
            }
          : undefined
      }
    >
      {text}
    </span>
  );
}
