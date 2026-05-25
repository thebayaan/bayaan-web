import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useNotes } from "@/hooks/use-notes";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

describe("useNotes", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("upsertNote creates a note when one doesn't exist", async () => {
    const { result } = renderHook(() => useNotes());
    await act(async () => {
      await result.current.upsertNote("1:1", "hello");
    });
    expect(result.current.byKey.get("1:1")?.content).toBe("hello");
  });

  it("upsertNote updates an existing note", async () => {
    useLibraryStore.getState().upsertNote("1:1", "old");
    const { result } = renderHook(() => useNotes());
    await act(async () => {
      await result.current.upsertNote("1:1", "new");
    });
    expect(result.current.byKey.get("1:1")?.content).toBe("new");
  });
});
