"use client";

import { useCallback, useMemo, useRef } from "react";
import type { QcfWord } from "@/types/quran-api";
import { QuranWord, type QcfFontResolver } from "./quran-word";
import { cn } from "@/lib/utils";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";

import type { MushafLineAlignment } from "./mushaf-layout";

interface VerseTextProps {
  words: QcfWord[];
  fontResolver: QcfFontResolver;
  mushafMode?: boolean;
  lineAlignment?: MushafLineAlignment;
  fontSize?: string;
  className?: string;
  /** Pass through to each QuranWord — click-to-select in mushaf view. */
  selectable?: boolean;
}

function sortWords(words: QcfWord[]): QcfWord[] {
  return [...words].sort((a, b) => a.position - b.position);
}

function primaryVerseKey(words: QcfWord[]): string {
  const endMarker = words.find((word) => word.char_type_name === "end");
  return endMarker?.verse_key ?? words[words.length - 1]?.verse_key ?? "";
}

function MushafLine({
  words,
  fontResolver,
  fontSize,
  className,
  selectable,
  lineAlignment = "right",
}: {
  words: QcfWord[];
  fontResolver: QcfFontResolver;
  fontSize: string;
  className?: string;
  selectable?: boolean;
  lineAlignment?: MushafLineAlignment;
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

  if (isFontLoaded) {
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
        className={cn(
          "w-full leading-[2.35] whitespace-nowrap",
          lineAlignment === "center" ? "text-center" : "text-right",
          selectable && "cursor-pointer",
          className,
        )}
        style={{ fontFamily, fontSize }}
      >
        {sortedWords.map((word) => word.code_v2).join("")}
      </div>
    );
  }

  return (
    <div
      ref={lineRef}
      dir="rtl"
      className={cn(
        "flex w-full flex-nowrap items-baseline leading-[2.35]",
        lineAlignment === "center" ? "justify-center" : "justify-between",
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
        />
      ))}
    </div>
  );
}
