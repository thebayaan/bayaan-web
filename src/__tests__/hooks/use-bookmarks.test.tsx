import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

describe("useBookmarks", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("isBookmarked reflects store contents", () => {
    useLibraryStore.getState().addBookmark({
      verse_key: "2:255",
      surah_number: 2,
      ayah_number: 255,
    });
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.isBookmarked("2:255")).toBe(true);
    expect(result.current.isBookmarked("1:1")).toBe(false);
  });

  it("toggleBookmark adds when missing and removes when present", async () => {
    const { result } = renderHook(() => useBookmarks());

    await act(async () => {
      await result.current.toggleBookmark({
        verse_key: "1:1",
        surah_number: 1,
        ayah_number: 1,
      });
    });
    expect(result.current.isBookmarked("1:1")).toBe(true);

    await act(async () => {
      await result.current.toggleBookmark({
        verse_key: "1:1",
        surah_number: 1,
        ayah_number: 1,
      });
    });
    expect(result.current.isBookmarked("1:1")).toBe(false);
  });
});
