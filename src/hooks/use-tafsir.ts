import useSWR from "swr";
import { sanitizeHtml } from "@/lib/sanitize";

export interface TafsirVerse {
  resource_id: number;
  verse_key: string;
  text: string;
}

interface TafsirResponse {
  tafsir: {
    verses: TafsirVerse[];
  };
}

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function fetchTafsir(tafsirId: string, verseKey: string): Promise<string | null> {
  const response = await fetch(
    `${BASE_URL}/api/quran-v4/tafsirs/${tafsirId}/by_ayah/${encodeURIComponent(verseKey)}`,
  );
  if (!response.ok) return null;
  const body = (await response.json()) as TafsirResponse;
  const text = body.tafsir?.verses?.[0]?.text;
  return text ? sanitizeHtml(text) : null;
}

export function useTafsir(
  verseKey: string | null,
  tafsirId: string,
): { text: string | null; isLoading: boolean } {
  const { data, isLoading } = useSWR(
    verseKey ? `tafsir:${tafsirId}:${verseKey}` : null,
    () => fetchTafsir(tafsirId, verseKey!),
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );

  return { text: data ?? null, isLoading };
}
