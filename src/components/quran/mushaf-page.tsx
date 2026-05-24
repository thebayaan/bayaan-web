"use client";
import { useMemo } from "react";
import type { QcfVerse, QcfWord } from "@/types/quran-api";
import type { QcfFontResolver } from "./quran-word";
import { VerseText } from "./verse-text";

interface MushafPageProps {
  verses: QcfVerse[];
  pageNumber: number;
  fontResolver: QcfFontResolver;
  fontSize: string;
}

export function MushafPage({
  verses,
  pageNumber,
  fontResolver,
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
    <article
      aria-label={`Mushaf page ${pageNumber}`}
      className="mx-auto flex min-h-[min(78vh,920px)] w-full flex-col rounded-2xl border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] px-5 py-8 shadow-sm"
    >
      <div className="flex flex-1 flex-col justify-center gap-1">
        {lines.map(([lineNumber, words]) => (
          <VerseText
            key={`line-${lineNumber}`}
            words={words}
            fontResolver={fontResolver}
            mushafMode
            selectable
            fontSize={fontSize}
            className="w-full"
          />
        ))}
      </div>
      <p className="text-muted-foreground mt-6 text-center text-xs tabular-nums">{pageNumber}</p>
    </article>
  );
}
