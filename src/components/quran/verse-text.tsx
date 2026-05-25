"use client";

import { useCallback, useMemo, useRef } from "react";
import type { QcfWord } from "@/types/quran-api";
import { QuranWord } from "./quran-word";
import { MushafBasmallah } from "./mushaf-surah-header";
import { cn } from "@/lib/utils";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import type { MushafFontResolver } from "@/lib/mushaf-fonts";
import { END_MARKER_FONT_FAMILY, joinMushafLineText } from "@/lib/mushaf-fonts";

import type { MushafLineAlignment } from "./mushaf-layout";

interface VerseTextProps {
  words: QcfWord[];
  fontResolver: MushafFontResolver;
  mushafMode?: boolean;
  lineAlignment?: MushafLineAlignment;
  fontSize?: string;
  className?: string;
  selectable?: boolean;
  wordAudioEnabled?: boolean;
  playbackActiveVerseKey?: string | null;
}

function sortWords(words: QcfWord[]): QcfWord[] {
  return [...words].sort((a, b) =>
    a.verse_id !== b.verse_id ? a.verse_id - b.verse_id : a.position - b.position,
  );
}

function primaryVerseKey(words: QcfWord[]): string {
  const endMarker = words.find((word) => word.char_type_name === "end");
  return endMarker?.verse_key ?? words[words.length - 1]?.verse_key ?? "";
}

function isFatihaBasmallah(words: QcfWord[]): boolean {
  const wordCount = words.filter((word) => word.char_type_name === "word").length;
  return words.some((word) => word.verse_key === "1:1") && wordCount >= 4;
}

function MushafLine({
  words,
  fontResolver,
  fontSize,
  className,
  selectable,
  lineAlignment = "right",
  playbackActiveVerseKey,
}: {
  words: QcfWord[];
  fontResolver: MushafFontResolver;
  fontSize: string;
  className?: string;
  selectable?: boolean;
  lineAlignment?: MushafLineAlignment;
  playbackActiveVerseKey?: string | null;
}) {
  const sortedWords = useMemo(() => sortWords(words), [words]);
  const pageNum = sortedWords[0]?.page_number ?? 1;
  const isFontLoaded = fontResolver.isPageFontLoaded(pageNum);
  const fontFamily = fontResolver.getFontFamily(pageNum);
  const lineRef = useRef<HTMLDivElement>(null);
  const toggle = useVerseSelectionStore((s) => s.toggle);

  const handleLineSelect = useCallback(() => {
    if (!selectable || !lineRef.current) return;
    const verseKey = primaryVerseKey(sortedWords);
    if (!verseKey) return;
    const rect = lineRef.current.getBoundingClientRect();
    toggle(verseKey, {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });
  }, [selectable, sortedWords, toggle]);

  const lineHasPlaybackAyah =
    playbackActiveVerseKey != null &&
    sortedWords.some((word) => word.verse_key === playbackActiveVerseKey);

  const lineFontPalette = fontResolver.getPageFontPalette?.(pageNum);
  const useFlexCenter = fontResolver.mushafLineCenter;
  const useTextCenter = lineAlignment === "center" && !useFlexCenter;
  const useJustifiedLine = fontResolver.mushafLineJustify && lineAlignment !== "center";
  const lineText = joinMushafLineText(sortedWords, fontResolver.config, (word) =>
    fontResolver.getWordText(word),
  );
  const lineFontFamily = isFontLoaded ? fontFamily : END_MARKER_FONT_FAMILY;

  const lineNode = (
    <div
      ref={lineRef}
      dir="rtl"
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? handleLineSelect : undefined}
      onKeyDown={
        selectable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleLineSelect();
              }
            }
          : undefined
      }
      className={cn(
        "whitespace-nowrap transition-colors",
        useFlexCenter && "inline-block leading-[2.5]",
        !useFlexCenter && "w-full leading-[2.35]",
        useTextCenter && "text-center leading-[2.5]",
        selectable && "cursor-pointer",
        lineHasPlaybackAyah && "rounded bg-[var(--brand-light)] ring-1 ring-[var(--brand-main)]/25",
        !useFlexCenter && className,
      )}
      data-verse-key={lineHasPlaybackAyah ? (playbackActiveVerseKey ?? undefined) : undefined}
      style={{
        fontFamily: lineFontFamily,
        fontSize,
        ...(lineFontPalette ? { fontPalette: lineFontPalette } : undefined),
        ...(useJustifiedLine
          ? {
              textAlign: "justify",
              textAlignLast: "justify",
            }
          : undefined),
      }}
    >
      {lineText}
    </div>
  );

  if (useFlexCenter) {
    return <div className={cn("flex w-full justify-center", className)}>{lineNode}</div>;
  }

  return lineNode;
}

export function VerseText({
  words,
  fontResolver,
  mushafMode,
  lineAlignment,
  fontSize = "1.8rem",
  className,
  selectable,
  wordAudioEnabled,
  playbackActiveVerseKey,
}: VerseTextProps) {
  if (mushafMode) {
    return (
      <MushafLine
        words={words}
        fontResolver={fontResolver}
        fontSize={fontSize}
        className={className}
        selectable={selectable}
        lineAlignment={lineAlignment}
        playbackActiveVerseKey={playbackActiveVerseKey}
      />
    );
  }

  if (isFatihaBasmallah(words)) {
    return (
      <MushafBasmallah
        fontSize={fontSize}
        fontResolver={fontResolver}
        className={cn("py-2", className)}
      />
    );
  }

  return (
    <div
      dir="rtl"
      className={cn("flex flex-wrap justify-start gap-x-1 leading-loose", className)}
      style={{ fontSize }}
    >
      {sortWords(words).map((word) => (
        <QuranWord
          key={`${word.verse_key}-${word.position}`}
          word={word}
          fontResolver={fontResolver}
          selectable={selectable}
          wordAudioEnabled={wordAudioEnabled}
          playbackActive={word.verse_key === playbackActiveVerseKey}
        />
      ))}
    </div>
  );
}
