import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ogSize, ogContentType, renderOgCard } from "@/lib/og";

const surahs = surahData as unknown as Surah[];

export const runtime = "nodejs";
export const alt = "Bayaan verse preview";
export const size = ogSize;
export const contentType = ogContentType;

export default async function VerseOg({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}) {
  const { surah, ayah } = await params;
  const surahId = Number(surah);
  const ayahId = Number(ayah);
  const match = surahs.find((s) => s.id === surahId);
  if (!match || ayahId < 1 || ayahId > match.verses_count) notFound();

  return renderOgCard({
    eyebrow: `Verse ${surahId}:${ayahId}`,
    title: `Surah ${match.name}`,
    subtitle: match.translated_name_english,
  });
}
