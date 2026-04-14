import useSWR from "swr";
import type { VersesResponse } from "@/types/quran-api";

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

const WORD_FIELDS =
  "verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs";

async function fetchVersesByChapter(path: string): Promise<VersesResponse> {
  const response = await fetch(`${BASE_URL}/api/quran/${path}`);
  if (!response.ok) {
    throw new Error(`Quran API error: ${response.status}`);
  }
  return response.json() as Promise<VersesResponse>;
}

export function useVersesByChapter(
  chapterId: number,
  page: number = 1,
  translationIds: string = "131",
): {
  verses: VersesResponse["verses"];
  pagination: VersesResponse["pagination"] | null;
  isLoading: boolean;
  error: Error | undefined;
} {
  const params = new URLSearchParams({
    words: "true",
    per_page: "50",
    fields: "text_uthmani,chapter_id,hizb_number",
    translations: translationIds,
    word_fields: WORD_FIELDS,
    mushaf: "1",
    page: page.toString(),
  });

  const { data, error, isLoading } = useSWR<VersesResponse>(
    chapterId > 0
      ? `verses/by_chapter/${chapterId}?${params.toString()}`
      : null,
    fetchVersesByChapter,
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );

  return {
    verses: data?.verses ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    error,
  };
}
