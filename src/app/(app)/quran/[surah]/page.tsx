import type { Metadata } from "next";
import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ReaderContent } from "@/components/quran/reader-content";
import { ReadingSubHeader } from "@/components/quran/reading-sub-header";
import { ReadingProgressTracker } from "@/components/quran/reading-progress-tracker";

const surahs = surahData as unknown as Surah[];

function resolveSurah(surah: string): Surah | null {
  const id = Number(surah);
  if (!Number.isInteger(id) || id < 1 || id > 114) return null;
  return surahs.find((s) => s.id === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surah: string }>;
}): Promise<Metadata> {
  const { surah } = await params;
  const match = resolveSurah(surah);
  if (!match) return { title: "Surah not found" };
  return {
    title: `Surah ${match.name} (${match.id})`,
    description: `Read Surah ${match.name} — ${match.translated_name_english}. ${match.verses_count} verses, revealed in ${match.revelation_place}.`,
  };
}

export default async function QuranSurahPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = await params;
  const match = resolveSurah(surah);
  if (!match) notFound();
  return (
    <>
      <ReadingSubHeader surah={match} />
      <ReadingProgressTracker surah={match} />
      <ReaderContent surahId={match.id} />
    </>
  );
}
