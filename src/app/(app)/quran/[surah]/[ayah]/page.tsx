import { notFound } from "next/navigation";
import type { Metadata } from "next";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ReadingView } from "@/components/quran/reading-view";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}): Promise<Metadata> {
  const { surah, ayah } = await params;
  const resolved = resolveSurahAyah(surah, ayah);
  if (!resolved) return { title: "Verse not found — Bayaan" };
  const match = surahs.find((s) => s.id === resolved.surahId)!;
  return {
    title: `Surah ${match.name} ${resolved.surahId}:${resolved.ayahId} — Bayaan`,
    description: `Verse ${resolved.surahId}:${resolved.ayahId} from Surah ${match.name} (${match.translated_name_english}).`,
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
  return <ReadingView surahId={resolved.surahId} targetAyah={resolved.ayahId} />;
}
