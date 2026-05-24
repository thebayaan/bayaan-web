"use client";
import { useEffect, useMemo, useRef } from "react";
import { useVersesByChapter } from "@/hooks/use-verses-by-chapter";
import { useQcfFont } from "@/hooks/use-qcf-font";
import {
  useReadingSettingsStore,
  type ReadingSettingsState,
} from "@/stores/reading-settings-store";
import { ReadingVerse } from "./reading-verse";
import { SurahHeader } from "./surah-header";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

function markRead(surahId: number): void {
  // Pull the setter fresh so the effect doesn't depend on an unstable
  // reference and re-fire on every store update.
  (useReadingSettingsStore.getState() as ReadingSettingsState).markSurahRead(surahId);
}

const surahs = surahData as unknown as Surah[];

interface ReadingViewProps {
  surahId: number;
  targetAyah?: number;
}

export function ReadingView({ surahId, targetAyah }: ReadingViewProps) {
  useEffect(() => {
    if (surahId >= 1 && surahId <= 114) markRead(surahId);
  }, [surahId]);

  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const translationIds = useReadingSettingsStore((s) => s.translationIds);
  const { verses, isLoading } = useVersesByChapter(surahId, translationIds);
  const pageNumbers = useMemo(
    () => [...new Set(verses.flatMap((v) => v.words.map((w) => w.page_number)))],
    [verses],
  );
  const { isPageFontLoaded, getFontFamily } = useQcfFont(pageNumbers);
  const surah = surahs.find((s) => s.id === surahId);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetKey = targetAyah ? `${surahId}:${targetAyah}` : null;

  useEffect(() => {
    if (!targetKey || isLoading || !targetRef.current) return;
    targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [targetKey, isLoading]);

  const fontResolver = useMemo(
    () => ({ isPageFontLoaded, getFontFamily }),
    [isPageFontLoaded, getFontFamily],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-6 py-8">
        <div className="mx-auto mb-8 h-12 w-48 rounded bg-[var(--text-alpha-06)]" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="mb-6 space-y-3">
            <div className="h-8 w-full rounded bg-[var(--text-alpha-06)]" />
            <div className="h-4 w-3/4 rounded bg-[var(--text-alpha-04)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {surah && (
        <SurahHeader
          surahNumber={surah.id}
          surahName={surah.name}
          showBismillah={surah.bismillah_pre}
        />
      )}
      <div className="mt-6">
        {verses.map((verse) => {
          const isTarget = targetKey !== null && verse.verse_key === targetKey;
          return (
            <ReadingVerse
              key={verse.verse_key}
              ref={isTarget ? targetRef : undefined}
              verse={verse}
              fontResolver={fontResolver}
              fontSize={`${fontSize}rem`}
              showTranslation={true}
              isTarget={isTarget}
            />
          );
        })}
      </div>
    </div>
  );
}
