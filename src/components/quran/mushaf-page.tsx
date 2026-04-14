"use client";
import { useMemo } from "react";
import type { QcfVerse, QcfWord } from "@/types/quran-api";
import { VerseText } from "./verse-text";

interface MushafPageProps {
  verses: QcfVerse[];
  pageNumber: number;
  isFontLoaded: boolean;
  fontFamily: string;
  fontSize: string;
}

export function MushafPage({
  verses,
  pageNumber,
  isFontLoaded,
  fontFamily,
  fontSize,
}: MushafPageProps) {
  const lines = useMemo(() => {
    const lineMap = new Map<number, QcfWord[]>();
    for (const verse of verses) {
      for (const word of verse.words) {
        if (word.page_number !== pageNumber) continue;
        const existing = lineMap.get(word.line_number) ?? [];
        existing.push(word);
        lineMap.set(word.line_number, existing);
      }
    }
    return [...lineMap.entries()].sort(([a], [b]) => a - b);
  }, [verses, pageNumber]);

  return (
    <div className="flex flex-col items-center min-h-[600px] px-4 py-6">
      {lines.map(([lineNumber, words]) => (
        <VerseText
          key={`line-${lineNumber}`}
          words={words}
          isFontLoaded={isFontLoaded}
          fontFamily={fontFamily}
          mushafMode
          fontSize={fontSize}
          className="w-full max-w-[640px]"
        />
      ))}
      <p className="text-xs text-muted-foreground mt-4">{pageNumber}</p>
    </div>
  );
}
