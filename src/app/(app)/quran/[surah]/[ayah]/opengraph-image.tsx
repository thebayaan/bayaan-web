import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { surahOgBackground, ogContentType, ogSize, renderOgCard, type OgTheme } from "@/lib/og";

const surahs = surahData as unknown as Surah[];

export const runtime = "nodejs";
export const alt = "Bayaan verse preview";
export const contentType = ogContentType;
export const size = ogSize;

export function generateImageMetadata() {
  return [
    { id: "dark", alt, size, contentType },
    { id: "light", alt, size, contentType },
  ];
}

export default async function VerseOg({
  params,
  id,
}: {
  params: Promise<{ surah: string; ayah: string }>;
  id: Promise<string>;
}) {
  const [{ surah, ayah }, imageId] = await Promise.all([params, id]);
  const surahId = Number(surah);
  const ayahId = Number(ayah);
  const match = surahs.find((s) => s.id === surahId);
  if (!match || ayahId < 1 || ayahId > match.verses_count) notFound();

  const theme: OgTheme = imageId === "light" ? "light" : "dark";

  return renderOgCard({
    eyebrow: `Verse ${surahId}:${ayahId}`,
    title: `Surah ${match.name}`,
    subtitle: match.translated_name_english,
    backgroundImage: surahOgBackground(match.id, theme),
    theme,
  });
}
