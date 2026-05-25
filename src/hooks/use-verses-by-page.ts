import useSWR from "swr";
import type { VersesResponse } from "@/types/quran-api";
import { MUSHAF_WORD_FIELDS, getMushafFontConfig } from "@/lib/mushaf-fonts";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function fetchVersesByPage(path: string): Promise<VersesResponse> {
  const response = await fetch(`${BASE_URL}/api/quran/${path}`);
  if (!response.ok) {
    throw new Error(`Quran API error: ${response.status}`);
  }
  return response.json() as Promise<VersesResponse>;
}

export function useVersesByPage(pageNumber: number): {
  verses: VersesResponse["verses"];
  isLoading: boolean;
  error: Error | undefined;
} {
  const quranFontId = useReadingSettingsStore((s) => s.quranFontId);
  const mushafId = getMushafFontConfig(quranFontId).mushafId;

  const params = new URLSearchParams({
    words: "true",
    per_page: "all",
    filter_page_words: "true",
    word_fields: MUSHAF_WORD_FIELDS,
    mushaf: mushafId.toString(),
  });

  const { data, error, isLoading } = useSWR<VersesResponse>(
    pageNumber > 0
      ? `verses/by_page/${pageNumber}?${params.toString()}&font=${quranFontId}`
      : null,
    fetchVersesByPage,
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );

  return { verses: data?.verses ?? [], isLoading, error };
}
