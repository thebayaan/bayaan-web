import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAyahTimestamps } from "@/hooks/use-ayah-timestamps";

describe("useAyahTimestamps", () => {
  it("returns empty timestamps when rewayatId is null", () => {
    const { result } = renderHook(() => useAyahTimestamps(null, 1));
    expect(result.current.timestamps).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches timestamps for a valid rewayat and surah", async () => {
    const { result } = renderHook(() => useAyahTimestamps("rewayat-1", 1));
    await waitFor(() => {
      expect(result.current.timestamps.length).toBeGreaterThan(0);
    });
    expect(result.current.timestamps[0]?.verse_key).toBe("1:1");
    expect(result.current.error).toBeUndefined();
  });
});
