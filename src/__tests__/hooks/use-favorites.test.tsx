import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

describe("useFavoriteReciters", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("isFavoriteReciter reflects store contents", () => {
    useLibraryStore.getState().addFavoriteReciter("reciter-A");
    const { result } = renderHook(() => useFavoriteReciters());
    expect(result.current.isFavoriteReciter("reciter-A")).toBe(true);
    expect(result.current.isFavoriteReciter("reciter-B")).toBe(false);
  });

  it("toggleFavoriteReciter adds when missing and removes when present", async () => {
    const { result } = renderHook(() => useFavoriteReciters());

    await act(async () => {
      await result.current.toggleFavoriteReciter("reciter-X");
    });
    expect(result.current.isFavoriteReciter("reciter-X")).toBe(true);

    await act(async () => {
      await result.current.toggleFavoriteReciter("reciter-X");
    });
    expect(result.current.isFavoriteReciter("reciter-X")).toBe(false);
  });
});
