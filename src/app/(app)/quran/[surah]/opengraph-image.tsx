import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { surahOgBackground, ogContentType, ogSize, renderOgCard, type OgTheme } from "@/lib/og";

const surahs = surahData as unknown as Surah[];

export const runtime = "nodejs";
export const alt = "Bayaan surah preview";
export const contentType = ogContentType;
export const size = ogSize;

export function generateImageMetadata() {
  return [
    { id: "dark", alt, size, contentType },
    { id: "light", alt, size, contentType },
  ];
}

export default async function QuranSurahOg({
  params,
  id,
}: {
  params: Promise<{ surah: string }>;
  id: Promise<string>;
}) {
  const [{ surah }, imageId] = await Promise.all([params, id]);
  const surahId = Number(surah);
  const match = surahs.find((s) => s.id === surahId);
  if (!match) notFound();

  const theme: OgTheme = imageId === "light" ? "light" : "dark";

  return renderOgCard({
    eyebrow: `Surah ${match.id}`,
    title: match.name,
    subtitle: `${match.translated_name_english} · ${match.verses_count} verses · ${match.revelation_place}`,
    backgroundImage: surahOgBackground(match.id, theme),
    theme,
  });
}
