import type { Metadata } from "next";
import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ReaderContent } from "@/components/quran/reader-content";
import { ReadingSubHeader } from "@/components/quran/reading-sub-header";
import { ogSurahUrl } from "@/lib/og-urls";

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
    openGraph: {
      images: [{ url: ogSurahUrl(match.id), width: 1200, height: 1200 }],
    },
    twitter: {
      images: [ogSurahUrl(match.id)],
    },
  };
}

type SearchParams = { v?: string | string[] };

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function QuranSurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ surah: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { surah } = await params;
  const match = resolveSurah(surah);
  if (!match) notFound();
  const { v } = await searchParams;
  const vRaw = pickFirst(v);
  const vNum = vRaw !== undefined ? Number(vRaw) : undefined;
  const targetAyah =
    vNum !== undefined && Number.isInteger(vNum) && vNum >= 1 && vNum <= match.verses_count
      ? vNum
      : undefined;
  return (
    <>
      <ReadingSubHeader surah={match} />
      <ReaderContent surahId={match.id} targetAyah={targetAyah} />
    </>
  );
}
