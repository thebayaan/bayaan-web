import useSWR from "swr";
import { useMemo } from "react";
import { fetchBayaan } from "@/lib/api";
import type { VerseBookmark } from "@/types/quran";

interface BookmarksResponse {
  data: VerseBookmark[];
}

export interface CreateBookmarkInput {
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  note?: string;
}

const KEY = "user/bookmarks";

export function useBookmarks() {
  const { data, error, isLoading, mutate } = useSWR<BookmarksResponse>(KEY, fetchBayaan, {
    revalidateOnFocus: false,
  });
  const bookmarks = data?.data ?? [];

  const bookmarkByKey = useMemo(() => {
    const map = new Map<string, VerseBookmark>();
    for (const bm of bookmarks) map.set(bm.verse_key, bm);
    return map;
  }, [bookmarks]);

  function isBookmarked(verseKey: string): boolean {
    return bookmarkByKey.has(verseKey);
  }

  async function addBookmark(input: CreateBookmarkInput): Promise<VerseBookmark> {
    const response = await fetchBayaan<{ data: VerseBookmark }>(KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    await mutate();
    return response.data;
  }

  async function removeBookmark(verseKey: string): Promise<void> {
    await mutate(
      (current) => ({ data: (current?.data ?? []).filter((b) => b.verse_key !== verseKey) }),
      { revalidate: false },
    );
    try {
      await fetchBayaan(`${KEY}/${encodeURIComponent(verseKey)}`, { method: "DELETE" });
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  async function toggleBookmark(input: CreateBookmarkInput): Promise<void> {
    if (bookmarkByKey.has(input.verse_key)) {
      await removeBookmark(input.verse_key);
    } else {
      await addBookmark(input);
    }
  }

  return {
    bookmarks,
    bookmarkByKey,
    isBookmarked,
    isLoading,
    error,
    mutate,
    addBookmark,
    removeBookmark,
    toggleBookmark,
  };
}
