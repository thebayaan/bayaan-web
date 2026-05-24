import useSWR from "swr";

export interface QuranSearchHit {
  verse_key: string;
  verse_id: number;
  text: string;
  highlighted: string;
  translations: Array<{ text: string; resource_id: number; resource_name: string }>;
}

interface QuranSearchResponse {
  search: {
    results: QuranSearchHit[];
    pagination: { current_page: number; total_pages: number; total_records: number };
  };
}

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function searchQuranText(query: string): Promise<QuranSearchHit[]> {
  const params = new URLSearchParams({
    q: query,
    size: "20",
    page: "0",
    language: "en",
  });
  const response = await fetch(`${BASE_URL}/api/quran-v4/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Quran search error: ${response.status}`);
  }
  const body = (await response.json()) as QuranSearchResponse;
  return body.search?.results ?? [];
}

export function useQuranTextSearch(query: string): {
  results: QuranSearchHit[];
  isLoading: boolean;
} {
  const trimmed = query.trim();
  const { data, isLoading } = useSWR(
    trimmed.length >= 3 ? `quran-text-search:${trimmed}` : null,
    () => searchQuranText(trimmed),
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  return { results: data ?? [], isLoading };
}
