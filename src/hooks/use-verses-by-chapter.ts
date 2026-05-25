import useSWR from "swr";
import type { VersesResponse } from "@/types/quran-api";

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

const WORD_FIELDS =
  "verse_key,verse_id,page_number,location,audio_url,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs";

const PER_PAGE = 50;

function buildChapterPath(chapterId: number, translationIds: string, page: number): string {
  const params = new URLSearchParams({
    words: "true",
    per_page: PER_PAGE.toString(),
    fields: "text_uthmani,chapter_id,hizb_number",
    translations: translationIds,
    word_fields: WORD_FIELDS,
    mushaf: "1",
    page: page.toString(),
  });
  return `verses/by_chapter/${chapterId}?${params.toString()}`;
}

async function fetchVersesPage(path: string): Promise<VersesResponse> {
  const response = await fetch(`${BASE_URL}/api/quran/${path}`);
  if (!response.ok) {
    throw new Error(`Quran API error: ${response.status}`);
  }
  return response.json() as Promise<VersesResponse>;
}

async function fetchAllChapterVerses(
  chapterId: number,
  translationIds: string,
): Promise<VersesResponse> {
  const first = await fetchVersesPage(buildChapterPath(chapterId, translationIds, 1));
  const totalPages = first.pagination?.total_pages ?? 1;

  if (totalPages <= 1) {
    return first;
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchVersesPage(buildChapterPath(chapterId, translationIds, index + 2)),
    ),
  );

  return {
    verses: [...first.verses, ...rest.flatMap((page) => page.verses)],
    pagination: first.pagination,
  };
}

export function useVersesByChapter(
  chapterId: number,
  translationIds: string = "131",
): {
  verses: VersesResponse["verses"];
  pagination: VersesResponse["pagination"] | null;
  isLoading: boolean;
  error: Error | undefined;
} {
  const { data, error, isLoading } = useSWR<VersesResponse>(
    chapterId > 0 ? `verses/by_chapter/${chapterId}/all?translations=${translationIds}` : null,
    () => fetchAllChapterVerses(chapterId, translationIds),
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );

  return {
    verses: data?.verses ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    error,
  };
}
