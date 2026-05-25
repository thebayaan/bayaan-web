import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTafsir } from "@/hooks/use-tafsir";

describe("useTafsir", () => {
  it("does not fetch when verseKey is null", () => {
    const { result } = renderHook(() => useTafsir(null, "169"));
    expect(result.current.text).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches and sanitizes tafsir text for a verse", async () => {
    const { result } = renderHook(() => useTafsir("2:255", "169"));
    await waitFor(() => {
      expect(result.current.text).toBeTruthy();
    });
    expect(result.current.text).toContain("Mock tafsir text");
    expect(result.current.isLoading).toBe(false);
  });
});
