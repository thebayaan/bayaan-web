import { useMemo } from "react";
import {
  useLibraryStore,
  type CreateBookmarkInput,
} from "@/stores/library-store";
import type { VerseBookmark } from "@/types/quran";

export type { CreateBookmarkInput };

export function useBookmarks() {
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const addBookmark = useLibraryStore((s) => s.addBookmark);
  const removeBookmark = useLibraryStore((s) => s.removeBookmark);

  const bookmarkByKey = useMemo(() => {
    const map = new Map<string, VerseBookmark>();
    for (const bookmark of bookmarks) map.set(bookmark.verse_key, bookmark);
    return map;
  }, [bookmarks]);

  function isBookmarked(verseKey: string): boolean {
    return bookmarkByKey.has(verseKey);
  }

  async function toggleBookmark(input: CreateBookmarkInput): Promise<void> {
    if (bookmarkByKey.has(input.verse_key)) {
      removeBookmark(input.verse_key);
      return;
    }
    addBookmark(input);
  }

  return {
    bookmarks,
    bookmarkByKey,
    isBookmarked,
    isLoading: false,
    error: undefined,
    mutate: async () => undefined,
    addBookmark: async (input: CreateBookmarkInput) => addBookmark(input),
    removeBookmark: async (verseKey: string) => removeBookmark(verseKey),
    toggleBookmark,
  };
}
