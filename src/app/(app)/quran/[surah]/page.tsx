import type { Metadata } from "next";
import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ReaderContent } from "@/components/quran/reader-content";
import { ReadingSubHeader } from "@/components/quran/reading-sub-header";
import { surahOgBackground, type OgTheme } from "@/lib/og";
const surahs = surahData as unknown as Surah[];

function resolveSurah(surah: string): Surah | null {
  const id = Number(surah);
  if (!Number.isInteger(id) || id < 1 || id > 114) return null;
  return surahs.find((s) => s.id === id) ?? null;
}

type SearchParams = { v?: string | string[]; theme?: string | string[] };

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ surah: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { surah } = await params;
  const { theme } = await searchParams;
  const match = resolveSurah(surah);
  if (!match) return { title: "Surah not found" };
  const t: OgTheme = pickFirst(theme) === "light" ? "light" : "dark";
  const title = `Surah ${match.name}`;
  const description = `Read Surah ${match.name} (${match.translated_name_english}). ${match.verses_count} verses, revealed in ${match.revelation_place}.`;
  const imageUrl = surahOgBackground(match.id, t);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 1200, alt: match.name }],
    },
    twitter: { title, description, images: [imageUrl] },
  };
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
