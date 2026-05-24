"use client";
import { useMemo } from "react";
import type { QcfVerse, QcfWord } from "@/types/quran-api";
import type { QcfFontResolver } from "./quran-word";
import {
  getMushafLineAlignment,
  getMushafPageSurah,
  isMushafFramedPage,
  MUSHAF_PAGE_CLASS,
} from "./mushaf-layout";
import { MushafFramedPage } from "./mushaf-framed-page";
import { VerseText } from "./verse-text";
import { cn } from "@/lib/utils";

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
    return [...lineMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([lineNumber, words]) => [lineNumber, [...words].sort((a, b) => a.position - b.position)] as const);
  }, [verses, pageNumber]);

  const isFramed = isMushafFramedPage(pageNumber);
  const surahNumber = getMushafPageSurah(pageNumber);
  const lineAlignment = getMushafLineAlignment(pageNumber);

  const lineElements = lines.map(([lineNumber, words]) => (
    <VerseText
      key={`line-${lineNumber}`}
      words={words}
      fontResolver={fontResolver}
      mushafMode
      lineAlignment={lineAlignment}
      selectable
      fontSize={fontSize}
      className="w-full"
    />
  ));

  return (
    <article aria-label={`Mushaf page ${pageNumber}`}>
      {isFramed && surahNumber ? (
        <MushafFramedPage pageNumber={pageNumber} surahNumber={surahNumber}>
          {lineElements}
        </MushafFramedPage>
      ) : (
        <div className={cn(`${MUSHAF_PAGE_CLASS} flex min-h-[min(85vh,960px)] flex-col py-10`)}>
          <div className="flex flex-1 flex-col justify-center gap-0.5">{lineElements}</div>
        </div>
      )}
      <p className="text-muted-foreground mt-4 text-center text-sm tabular-nums">{pageNumber}</p>
    </article>
  );
}
