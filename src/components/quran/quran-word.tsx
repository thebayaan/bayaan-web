"use client";
import { useCallback, useRef } from "react";
import type { QcfWord } from "@/types/quran-api";
import { cn } from "@/lib/utils";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useWordAudioStore } from "@/stores/word-audio-store";
import { useHighlights, HIGHLIGHT_SWATCH } from "@/hooks/use-highlights";

export interface QcfFontResolver {
  isPageFontLoaded: (pageNum: number) => boolean;
  getFontFamily: (pageNum: number) => string;
}

interface QuranWordProps {
  word: QcfWord;
  fontResolver: QcfFontResolver;
  className?: string;
  selectable?: boolean;
  /** Tap to hear word pronunciation (independent of word-by-word toggle). */
  wordAudioEnabled?: boolean;
  /** Ayah is currently playing in the recitation player. */
  playbackActive?: boolean;
}

export function QuranWord({
  word,
  fontResolver,
  className,
  selectable = false,
  wordAudioEnabled = false,
  playbackActive = false,
}: QuranWordProps) {
  const pageNum = word.page_number;
  const isFontLoaded = fontResolver.isPageFontLoaded(pageNum);
  const fontFamily = fontResolver.getFontFamily(pageNum);
  const text = isFontLoaded ? word.code_v2 : word.qpc_uthmani_hafs;
  const showWordByWord = useReadingSettingsStore((s) => s.showWordByWord);
  const toggle = useVerseSelectionStore((s) => s.toggle);
  const selectedVerseKey = useVerseSelectionStore((s) => s.selectedVerseKey);
  const activeLocation = useWordAudioStore((s) => s.activeLocation);
  const playWord = useWordAudioStore((s) => s.play);
  const isSelected = selectable && selectedVerseKey === word.verse_key;
  const isWordActive = activeLocation === word.location;
  const canPlayWord = wordAudioEnabled && word.char_type_name === "word" && Boolean(word.audio_url);
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

  const handleClick = useCallback(() => {
    if (canPlayWord) {
      void playWord(word);
      return;
    }
    if (selectable) {
      handleSelect();
    }
  }, [canPlayWord, playWord, word, selectable, handleSelect]);

  const hasPopover = Boolean(word.translation?.text || word.transliteration?.text);
  const showHoverPopover = showWordByWord && hasPopover && !isWordActive;
  const showTapPopover = isWordActive && hasPopover;

  return (
    <span
      ref={ref}
      className={cn(
        "group/word relative inline-block transition-colors",
        (canPlayWord || selectable) && "cursor-pointer hover:text-[var(--brand-main)]",
        !isFontLoaded && "font-[UthmanicHafs]",
        isSelected && "rounded bg-[var(--text-alpha-10)]",
        playbackActive && "rounded bg-[var(--brand-light)] text-[var(--brand-main)]",
        isWordActive && "rounded text-[var(--brand-main)] ring-2 ring-[var(--brand-main)]/40",
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
      data-word-location={word.location}
      onClick={canPlayWord || selectable ? handleClick : undefined}
      role={canPlayWord || selectable ? "button" : undefined}
      tabIndex={canPlayWord || selectable ? 0 : undefined}
      onKeyDown={
        canPlayWord || selectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      {text}
      {showHoverPopover ? <WordPopover word={word} /> : null}
      {showTapPopover ? <WordTapPopover word={word} /> : null}
    </span>
  );
}

function WordPopover({ word }: { word: QcfWord }) {
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute -top-2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1 rounded-xl bg-[var(--foreground)] px-3 py-2 text-center opacity-0 shadow-[var(--elevation-m)] transition-opacity duration-[160ms]",
        "group-hover/word:opacity-100",
        "whitespace-nowrap",
      )}
      style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
    >
      <WordPopoverContent word={word} />
    </span>
  );
}

function WordTapPopover({ word }: { word: QcfWord }) {
  return (
    <span
      role="status"
      className={cn(
        "pointer-events-none absolute -top-2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1 rounded-xl bg-[var(--foreground)] px-3 py-2 text-center shadow-[var(--elevation-m)]",
        "whitespace-nowrap",
      )}
      style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
    >
      <WordPopoverContent word={word} />
    </span>
  );
}

function WordPopoverContent({ word }: { word: QcfWord }) {
  return (
    <>
      {word.transliteration?.text ? (
        <span className="text-[13px] leading-tight font-semibold text-[var(--background)]">
          {word.transliteration.text}
        </span>
      ) : null}
      {word.translation?.text ? (
        <span className="text-[11px] leading-tight text-[var(--background)]/70">
          {word.translation.text}
        </span>
      ) : null}
    </>
  );
}
