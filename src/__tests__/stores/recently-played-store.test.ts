import { describe, it, expect, beforeEach } from "vitest";
import { useRecentlyPlayedStore } from "@/stores/recently-played-store";

const baseEntry = {
  reciterId: "r1",
  rewayatId: "rw1",
  surahId: 36,
  reciterName: "Sample",
  surahName: "Ya-Sin",
  artwork: null,
};

describe("useRecentlyPlayedStore", () => {
  beforeEach(() => {
    useRecentlyPlayedStore.setState({ entries: [] });
  });

  it("push prepends a new entry with a playedAt timestamp", () => {
    useRecentlyPlayedStore.getState().push(baseEntry);
    const [entry] = useRecentlyPlayedStore.getState().entries;
    expect(entry?.reciterId).toBe("r1");
    expect(entry?.playedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("dedupes by (reciterId, rewayatId, surahId) and moves duplicates to the front", () => {
    useRecentlyPlayedStore.getState().push(baseEntry);
    useRecentlyPlayedStore.getState().push({ ...baseEntry, surahId: 1, surahName: "Al-Fatihah" });
    useRecentlyPlayedStore.getState().push(baseEntry);
    const entries = useRecentlyPlayedStore.getState().entries;
    expect(entries).toHaveLength(2);
    expect(entries[0]?.surahId).toBe(36);
    expect(entries[1]?.surahId).toBe(1);
  });

  it("caps the list at 20 entries", () => {
    for (let i = 0; i < 25; i++) {
      useRecentlyPlayedStore.getState().push({ ...baseEntry, surahId: i + 1 });
    }
    expect(useRecentlyPlayedStore.getState().entries).toHaveLength(20);
    // Most recent first
    expect(useRecentlyPlayedStore.getState().entries[0]?.surahId).toBe(25);
  });
});
