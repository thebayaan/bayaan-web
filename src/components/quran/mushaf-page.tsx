"use client";
import { Fragment, useMemo } from "react";
import type { QcfVerse, QcfWord } from "@/types/quran-api";
import type { MushafFontResolver } from "@/lib/mushaf-fonts";
import {
  getMushafLineAlignment,
  getMushafPageSurah,
  isMushafFramedPage,
  MUSHAF_PAGE_CLASS,
  surahHasInlineBasmallah,
} from "./mushaf-layout";
import { MushafFramedPage } from "./mushaf-framed-page";
import { MushafBasmallah, MushafSurahHeader } from "./mushaf-surah-header";
import { VerseText } from "./verse-text";
import { cn } from "@/lib/utils";

interface MushafPageProps {
  verses: QcfVerse[];
  pageNumber: number;
  fontResolver: MushafFontResolver;
  fontSize: string;
  playbackActiveVerseKey?: string | null;
}

export function MushafPage({
  verses,
  pageNumber,
  fontResolver,
  fontSize,
  playbackActiveVerseKey,
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
    // Sort by (verse_id, position) — NEVER by position alone. `position` is
    // word-index within a verse and resets to 1 for every new verse, so
    // sorting only by position scrambles word order on any line that
    // contains multiple verses (e.g. line 3 of page 50 holds 3:1, 3:2, 3:3
    // — sorting by position would interleave them into 3:1:1 / 3:2:1 /
    // 3:3:1 / 3:1:2 / 3:2:2 / ... which is exactly the garbled output we
    // were seeing). The QF API already returns verses in reading order and
    // words within a verse in position order, so this comparator preserves
    // that ordering while also being robust to any out-of-order input.
    return [...lineMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(
        ([lineNumber, words]) =>
          [
            lineNumber,
            [...words].sort((a, b) =>
              a.verse_id !== b.verse_id ? a.verse_id - b.verse_id : a.position - b.position,
            ),
          ] as const,
      );
  }, [verses, pageNumber]);

  const isFramed = isMushafFramedPage(pageNumber);
  const surahNumber = getMushafPageSurah(pageNumber);
  const lineAlignment = getMushafLineAlignment(pageNumber);

  // Map each line-number to the surah whose first ayah starts on it.
  // A line is a "surah start" when any word on it is `verse_number=1`
  // AND `position=1`. We derive this from `verses` directly (rather than
  // the line-grouped `lines`) so the check is unambiguous — verses are
  // already labelled with `verse_number` by the QF API.
  //
  // The two real-world shapes this handles:
  //
  //   - Top-of-page starts (e.g. page 151 / Al-A'raf): the QF API
  //     returns ayah lines 3..15 and the missing lines 1..2 are exactly
  //     where the printed mushaf draws the surah-name banner and the
  //     basmallah. Inserting our header components *before* the line-3
  //     <VerseText> reproduces that layout.
  //
  //   - Mid-page starts (e.g. page 106 where An-Nisa ends and Al-Ma'idah
  //     begins): the API returns 4:176 on lines 1..5 then 5:1 on line 8;
  //     lines 6 & 7 are missing because the printed mushaf reserves them
  //     for Al-Ma'idah's surah-name banner and basmallah. Inserting our
  //     header components before the line-8 <VerseText> drops them into
  //     exactly the right vertical position.
  const surahStartsByLine = useMemo(() => {
    const map = new Map<number, number>();
    if (isFramed) return map;
    for (const verse of verses) {
      if (verse.verse_number !== 1) continue;
      const firstWord = verse.words.find((w) => w.page_number === pageNumber && w.position === 1);
      if (!firstWord) continue;
      const [surahStr] = verse.verse_key.split(":");
      const surahN = Number(surahStr);
      if (Number.isFinite(surahN)) {
        map.set(firstWord.line_number, surahN);
      }
    }
    return map;
  }, [verses, pageNumber, isFramed]);

  const lineElements = lines.map(([lineNumber, words]) => {
    const surahStart = surahStartsByLine.get(lineNumber);
    const verseText = (
      <VerseText
        key={`line-${lineNumber}`}
        words={words}
        fontResolver={fontResolver}
        mushafMode
        lineAlignment={lineAlignment}
        selectable
        fontSize={fontSize}
        className="w-full"
        playbackActiveVerseKey={playbackActiveVerseKey}
      />
    );
    if (surahStart == null) return verseText;
    return (
      <Fragment key={`line-${lineNumber}`}>
        <MushafSurahHeader surahNumber={surahStart} />
        {surahHasInlineBasmallah(surahStart) ? (
          <MushafBasmallah fontSize={fontSize} fontResolver={fontResolver} />
        ) : null}
        {verseText}
      </Fragment>
    );
  });

  const pageWidthScale = fontResolver.config.mushafPageWidthScale;
  const pageClass = pageWidthScale ? "mx-auto w-full" : MUSHAF_PAGE_CLASS;
  const pageStyle = pageWidthScale
    ? { maxWidth: `${pageWidthScale * parseFloat(fontSize)}rem` }
    : undefined;

  return (
    <article aria-label={`Mushaf page ${pageNumber}`}>
      {isFramed && surahNumber ? (
        <MushafFramedPage
          pageNumber={pageNumber}
          surahNumber={surahNumber}
          fontResolver={fontResolver}
          fontSize={fontSize}
        >
          {lineElements}
        </MushafFramedPage>
      ) : (
        <div
          className={cn(`${pageClass} flex min-h-[min(85vh,960px)] flex-col py-10`)}
          style={pageStyle}
        >
          <div className="flex flex-1 flex-col justify-center gap-0.5">{lineElements}</div>
        </div>
      )}
      <p className="text-muted-foreground mt-4 text-center text-sm tabular-nums">{pageNumber}</p>
    </article>
  );
}
