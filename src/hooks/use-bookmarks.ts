import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { VerseBookmark } from "@/types/quran";

interface BookmarksResponse {
  data: VerseBookmark[];
}

export function useBookmarks() {
  const { data, error, isLoading, mutate } = useSWR<BookmarksResponse>(
    "user/bookmarks",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { bookmarks: data?.data ?? [], isLoading, error, mutate };
}
