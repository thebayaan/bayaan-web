"use client";
import { useMemo } from "react";
import { useVersesByChapter } from "@/hooks/use-verses-by-chapter";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { ReadingVerse } from "./reading-verse";
import { SurahHeader } from "./surah-header";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];

export function ReadingView({ surahId }: { surahId: number }) {
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const translationIds = useReadingSettingsStore((s) => s.translationIds);
  const { verses, isLoading } = useVersesByChapter(surahId, 1, translationIds);
  const pageNumbers = useMemo(
    () => [
      ...new Set(verses.flatMap((v) => v.words.map((w) => w.page_number))),
    ],
    [verses],
  );
  const { isPageFontLoaded, getFontFamily } = useQcfFont(pageNumbers);
  const surah = surahs.find((s) => s.id === surahId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-12 w-48 bg-[var(--text-alpha-06)] rounded mx-auto mb-8" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="mb-6 space-y-3">
            <div className="h-8 bg-[var(--text-alpha-06)] rounded w-full" />
            <div className="h-4 bg-[var(--text-alpha-04)] rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const primaryPage = verses[0]?.words[0]?.page_number ?? 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {surah && (
        <SurahHeader
          surahNumber={surah.id}
          surahName={surah.name}
          showBismillah={surah.bismillah_pre}
        />
      )}
      <div className="mt-6">
        {verses.map((verse) => (
          <ReadingVerse
            key={verse.verse_key}
            verse={verse}
            isFontLoaded={isPageFontLoaded(primaryPage)}
            fontFamily={getFontFamily(primaryPage)}
            fontSize={`${fontSize}rem`}
            showTranslation={true}
          />
        ))}
      </div>
    </div>
  );
}
