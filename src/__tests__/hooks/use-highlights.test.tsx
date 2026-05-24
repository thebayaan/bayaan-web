import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHighlights } from "@/hooks/use-highlights";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

describe("useHighlights", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("getHighlight returns the stored color", () => {
    useLibraryStore.getState().setHighlight("2:255", "green");
    const { result } = renderHook(() => useHighlights());
    expect(result.current.getHighlight("2:255")?.color).toBe("green");
    expect(result.current.getHighlight("1:1")).toBeUndefined();
  });

  it("setHighlight stores the color locally", async () => {
    const { result } = renderHook(() => useHighlights());
    await act(async () => {
      await result.current.setHighlight("1:1", "yellow");
    });
    expect(result.current.getHighlight("1:1")?.color).toBe("yellow");
  });

  it("removeHighlight clears the verse from the store", async () => {
    useLibraryStore.getState().setHighlight("2:255", "blue");
    const { result } = renderHook(() => useHighlights());
    await act(async () => {
      await result.current.removeHighlight("2:255");
    });
    expect(result.current.getHighlight("2:255")).toBeUndefined();
  });
});
