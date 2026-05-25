import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQuranTextSearch } from "@/hooks/use-quran-text-search";

describe("useQuranTextSearch", () => {
  it("does not fetch when query is shorter than 3 characters", () => {
    const { result } = renderHook(() => useQuranTextSearch("ab"));
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("does not fetch for whitespace-only queries", () => {
    const { result } = renderHook(() => useQuranTextSearch("   "));
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches and returns search hits for valid queries", async () => {
    const { result } = renderHook(() => useQuranTextSearch("allah"));
    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0);
    });
    expect(result.current.results[0]?.verse_key).toBe("2:255");
    expect(result.current.isLoading).toBe(false);
  });

  it("trims query before searching", async () => {
    const { result } = renderHook(() => useQuranTextSearch("  mercy  "));
    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0);
    });
  });
});
