import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTimestampLoader } from "@/hooks/use-timestamp-loader";
import { usePlayerStore } from "@/stores/player-store";
import { useAyahTrackerStore } from "@/stores/ayah-tracker-store";
import type { Track } from "@/types/audio";

const sampleTrack: Track = {
  id: "reciter-1:rewayat-1:1",
  url: "https://cdn.example.com/001.mp3",
  title: "Al-Fatiha",
  artist: "Mishary Alafasy",
  artwork: "",
  duration: 60000,
  reciterId: "reciter-1",
  reciterName: "Mishary Alafasy",
  surahId: 1,
  rewayatId: "rewayat-1",
};

describe("useTimestampLoader", () => {
  beforeEach(() => {
    useAyahTrackerStore.getState().clear();
    usePlayerStore.setState({
      queue: { tracks: [], currentIndex: 0, shuffleOrder: null, shufflePosition: 0 },
    });
  });

  it("clears tracker state when there is no current track", () => {
    useAyahTrackerStore
      .getState()
      .setTimestamps("rewayat-1:1", 1, [
        { verse_key: "1:1", timestamp_from: 0, timestamp_to: 1000 },
      ]);
    renderHook(() => useTimestampLoader());
    expect(useAyahTrackerStore.getState().timestamps).toEqual([]);
    expect(useAyahTrackerStore.getState().cacheKey).toBeNull();
  });

  it("loads timestamps when the current track changes", async () => {
    usePlayerStore.setState({
      queue: { tracks: [sampleTrack], currentIndex: 0, shuffleOrder: null, shufflePosition: 0 },
    });

    renderHook(() => useTimestampLoader());

    await waitFor(() => {
      expect(useAyahTrackerStore.getState().cacheKey).toBe("rewayat-1:1");
    });
    expect(useAyahTrackerStore.getState().trackedSurahId).toBe(1);
    expect(useAyahTrackerStore.getState().timestamps.length).toBeGreaterThan(0);
  });

  it("skips reload when timestamps are already cached for the track", async () => {
    useAyahTrackerStore
      .getState()
      .setTimestamps("rewayat-1:1", 1, [
        { verse_key: "1:1", timestamp_from: 0, timestamp_to: 1000 },
      ]);
    usePlayerStore.setState({
      queue: { tracks: [sampleTrack], currentIndex: 0, shuffleOrder: null, shufflePosition: 0 },
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderHook(() => useTimestampLoader());

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("reloads when cached timestamps are malformed CDN rows", async () => {
    useAyahTrackerStore.getState().setTimestamps("rewayat-1:1", 1, [
      {
        surahNumber: 1,
        ayahNumber: 1,
        timestampFrom: 0,
        timestampTo: 1000,
      } as never,
    ]);
    usePlayerStore.setState({
      queue: { tracks: [sampleTrack], currentIndex: 0, shuffleOrder: null, shufflePosition: 0 },
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderHook(() => useTimestampLoader());

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(useAyahTrackerStore.getState().timestamps[0]?.verse_key).toBe("1:1");
    });
  });
});
