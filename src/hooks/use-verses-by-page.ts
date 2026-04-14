import useSWR from "swr";
import type { VersesResponse } from "@/types/quran-api";

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

const WORD_FIELDS =
  "verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs,line_number";

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
  const params = new URLSearchParams({
    words: "true",
    per_page: "all",
    filter_page_words: "true",
    word_fields: WORD_FIELDS,
    mushaf: "1",
  });

  const { data, error, isLoading } = useSWR<VersesResponse>(
    pageNumber > 0 ? `verses/by_page/${pageNumber}?${params.toString()}` : null,
    fetchVersesByPage,
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );

  return { verses: data?.verses ?? [], isLoading, error };
}
