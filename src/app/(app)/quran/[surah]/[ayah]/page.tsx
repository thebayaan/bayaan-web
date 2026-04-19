import { notFound } from "next/navigation";
import type { Metadata } from "next";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ReadingView } from "@/components/quran/reading-view";
import { ReadingSubHeader } from "@/components/quran/reading-sub-header";
import { surahOgBackground, type OgTheme } from "@/lib/og";
const surahs = surahData as unknown as Surah[];

function resolveSurahAyah(surah: string, ayah: string): { surahId: number; ayahId: number } | null {
  const surahId = Number(surah);
  const ayahId = Number(ayah);
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) return null;
  if (!Number.isInteger(ayahId) || ayahId < 1) return null;
  const match = surahs.find((s) => s.id === surahId);
  if (!match || ayahId > match.verses_count) return null;
  return { surahId, ayahId };
}

type SearchParams = { theme?: string | string[] };

function pickFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ surah: string; ayah: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { surah, ayah } = await params;
  const { theme } = await searchParams;
  const resolved = resolveSurahAyah(surah, ayah);
  if (!resolved) return { title: "Verse not found" };
  const match = surahs.find((s) => s.id === resolved.surahId)!;
  const t: OgTheme = pickFirst(theme) === "light" ? "light" : "dark";
  const title = `Verse ${resolved.surahId}:${resolved.ayahId} - ${match.name}`;
  const description = `Verse ${resolved.surahId}:${resolved.ayahId} from Surah ${match.name} (${match.translated_name_english}).`;
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

export default async function QuranAyahPage({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}) {
  const { surah, ayah } = await params;
  const resolved = resolveSurahAyah(surah, ayah);
  if (!resolved) notFound();
  const match = surahs.find((s) => s.id === resolved.surahId)!;
  return (
    <>
      <ReadingSubHeader surah={match} />
      <ReadingView surahId={resolved.surahId} targetAyah={resolved.ayahId} />
    </>
  );
}
