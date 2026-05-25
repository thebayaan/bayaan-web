"use client";

import { useCallback, useMemo, useRef } from "react";
import type { QcfWord } from "@/types/quran-api";
import { QuranWord } from "./quran-word";
import { cn } from "@/lib/utils";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import type { MushafFontResolver } from "@/lib/mushaf-fonts";
import { joinMushafGlyphLine } from "@/lib/mushaf-fonts";

import type { MushafLineAlignment } from "./mushaf-layout";

interface VerseTextProps {
  words: QcfWord[];
  fontResolver: MushafFontResolver;
  mushafMode?: boolean;
  lineAlignment?: MushafLineAlignment;
  fontSize?: string;
  className?: string;
  /** Pass through to each QuranWord — click-to-select in mushaf view. */
  selectable?: boolean;
  /** Tap a word to hear pronunciation (reading view). */
  wordAudioEnabled?: boolean;
  /** Highlight words for the ayah currently playing in the player. */
  playbackActiveVerseKey?: string | null;
}

// Hair-space (U+200A) separators for glyph line joining live in
// `joinMushafGlyphLine` inside `src/lib/mushaf-fonts.ts`.

/**
 * Order words within a single rendered group (a verse in reading mode, or a
 * mushaf line that may span several verses) in canonical reading order.
 *
 * IMPORTANT: sort by (verse_id, position), NEVER by position alone. The
 * QF API resets `position` to 1 at the start of every verse, so any line
 * that holds multiple verses (e.g. line 3 of page 50 — verses 3:1, 3:2,
 * 3:3 all land there) would otherwise interleave into 3:1:1 / 3:2:1 /
 * 3:3:1 / 3:1:2 / 3:2:2 / ... — exactly the "smooshed / missing ayahs /
 * garbled text" symptom we were chasing.
 */
function sortWords(words: QcfWord[]): QcfWord[] {
  return [...words].sort((a, b) =>
    a.verse_id !== b.verse_id ? a.verse_id - b.verse_id : a.position - b.position,
  );
}

function primaryVerseKey(words: QcfWord[]): string {
  const endMarker = words.find((word) => word.char_type_name === "end");
  return endMarker?.verse_key ?? words[words.length - 1]?.verse_key ?? "";
}

function joinMushafLine(words: QcfWord[], fontResolver: MushafFontResolver): string {
  if (fontResolver.useGlyphLineJoin) {
    return joinMushafGlyphLine(words, fontResolver.config);
  }
  return words
    .map((word) => fontResolver.getWordText(word) ?? "")
    .filter(Boolean)
    .join("\u200A");
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

  const useJoinedLine = fontResolver.useGlyphLineJoin && isFontLoaded;
  const isCenter = lineAlignment === "center";
  const lineClassName = cn(
    "w-full whitespace-nowrap transition-colors",
    isCenter ? "text-center leading-[1.85]" : "leading-[2.35]",
    selectable && "cursor-pointer",
    lineHasPlaybackAyah &&
      "rounded bg-[var(--brand-light)] ring-1 ring-[var(--brand-main)]/25",
    className,
  );

  if (useJoinedLine) {
    return (
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
        className={lineClassName}
        data-verse-key={lineHasPlaybackAyah ? (playbackActiveVerseKey ?? undefined) : undefined}
        style={{
          fontFamily,
          fontSize,
          ...(fontResolver.fontPalette ? { fontPalette: fontResolver.fontPalette } : undefined),
          ...(isCenter
            ? null
            : {
                textAlign: "justify",
                textAlignLast: "justify",
              }),
        }}
      >
        {joinMushafLine(sortedWords, fontResolver)}
      </div>
    );
  }

  if (isFontLoaded && !fontResolver.useGlyphLineJoin) {
    return (
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
        className={cn(lineClassName, !isCenter && "text-right")}
        data-verse-key={lineHasPlaybackAyah ? (playbackActiveVerseKey ?? undefined) : undefined}
        style={{ fontFamily, fontSize }}
      >
        {joinMushafLine(sortedWords, fontResolver)}
      </div>
    );
  }

  return (
    <div
      ref={lineRef}
      dir="rtl"
      className={cn(
        "flex w-full flex-nowrap items-baseline",
        lineAlignment === "center"
          ? "justify-center leading-[1.85]"
          : "justify-between leading-[2.35]",
        className,
      )}
      style={{ fontSize }}
    >
      {sortedWords.map((word) => (
        <QuranWord
          key={`${word.verse_key}-${word.position}`}
          word={word}
          fontResolver={fontResolver}
          selectable={selectable}
          playbackActive={word.verse_key === playbackActiveVerseKey}
          className="shrink-0"
        />
      ))}
    </div>
  );
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
