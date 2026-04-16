import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ogSize, ogContentType, renderOgCard } from "@/lib/og";

const surahs = surahData as unknown as Surah[];

export const runtime = "nodejs";
export const alt = "Bayaan surah preview";
export const size = ogSize;
export const contentType = ogContentType;

export default async function QuranSurahOg({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = await params;
  const id = Number(surah);
  const match = surahs.find((s) => s.id === id);
  if (!match) notFound();

  return renderOgCard({
    eyebrow: `Surah ${match.id}`,
    title: match.name,
    subtitle: `${match.translated_name_english} · ${match.verses_count} verses · ${match.revelation_place}`,
  });
}
