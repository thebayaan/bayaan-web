import useSWR from "swr";
import type { VersesResponse } from "@/types/quran-api";
import { MUSHAF_WORD_FIELDS, getMushafFontConfig } from "@/lib/mushaf-fonts";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

const PER_PAGE = 50;

function buildChapterPath(
  chapterId: number,
  translationIds: string,
  page: number,
  mushafId: number,
): string {
  const params = new URLSearchParams({
    words: "true",
    per_page: PER_PAGE.toString(),
    fields: "text_uthmani,chapter_id,hizb_number",
    translations: translationIds,
    word_fields: MUSHAF_WORD_FIELDS,
    mushaf: mushafId.toString(),
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
  mushafId: number,
): Promise<VersesResponse> {
  const first = await fetchVersesPage(buildChapterPath(chapterId, translationIds, 1, mushafId));
  const totalPages = first.pagination?.total_pages ?? 1;

  if (totalPages <= 1) {
    return first;
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchVersesPage(buildChapterPath(chapterId, translationIds, index + 2, mushafId)),
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
  const quranFontId = useReadingSettingsStore((s) => s.quranFontId);
  const mushafId = getMushafFontConfig(quranFontId).mushafId;

  const { data, error, isLoading } = useSWR<VersesResponse>(
    chapterId > 0
      ? `verses/by_chapter/${chapterId}/all?translations=${translationIds}&mushaf=${mushafId}&font=${quranFontId}`
      : null,
    () => fetchAllChapterVerses(chapterId, translationIds, mushafId),
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );

  return {
    verses: data?.verses ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    error,
  };
}
