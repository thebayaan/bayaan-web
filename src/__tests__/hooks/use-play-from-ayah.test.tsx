import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePlayFromAyah } from "@/hooks/use-play-from-ayah";
import { useReaderPlayerStore } from "@/stores/reader-player-store";
import { usePlayerStore } from "@/stores/player-store";
import { useWordAudioStore } from "@/stores/word-audio-store";
import type { QcfVerse } from "@/types/quran-api";

const mockReciter = {
  id: "reciter-1",
  name: "Mishary Alafasy",
  slug: "mishary-alafasy",
  rewayat: [
    {
      id: "rewayat-1",
      reciter_id: "reciter-1",
      name: "Hafs",
      style: "murattal",
      server: "https://cdn.example.com/",
      source_type: "mp3quran",
      surah_total: 114,
      surah_list: [1, 2, 3],
      mp3quran_read_id: 11,
      qdc_reciter_id: null,
      has_timestamps: true,
    },
  ],
};

vi.mock("@/hooks/use-reciters", () => ({
  useReciters: () => ({ reciters: [mockReciter], isLoading: false, featured: [] }),
}));

const fetchBayaanMock = vi.fn();
vi.mock("@/lib/api", () => ({
  fetchBayaan: (...args: unknown[]) => fetchBayaanMock(...args),
}));

const sampleVerse: QcfVerse = {
  id: 1,
  verse_number: 2,
  verse_key: "1:2",
  hizb_number: 1,
  rub_el_hizb_number: 1,
  ruku_number: 1,
  manzil_number: 1,
  sajdah_number: null,
  page_number: 1,
  juz_number: 1,
  chapter_id: 1,
  text_uthmani: "x",
  words: [],
};

describe("usePlayFromAyah", () => {
  beforeEach(() => {
    useReaderPlayerStore.setState({ lastReciterId: null, lastRewayatId: null });
    usePlayerStore.setState({
      queue: { tracks: [], currentIndex: 0, shuffleOrder: null, shufflePosition: 0 },
      playback: {
        isPlaying: false,
        currentTrackIndex: -1,
        positionMs: 0,
        durationMs: 0,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });
    fetchBayaanMock.mockReset();
    fetchBayaanMock.mockResolvedValue({ data: { url: "https://cdn.example.com/custom/001.mp3" } });
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/timestamps/")) {
        return new Response(
          JSON.stringify({
            data: {
              rewayat_id: "rewayat-1",
              surah: 1,
              timestamps: [
                { verse_key: "1:1", timestamp_from: 0, timestamp_to: 5000 },
                { verse_key: "1:2", timestamp_from: 5000, timestamp_to: 10000 },
              ],
            },
          }),
          { status: 200 },
        );
      }
      return new Response("{}", { status: 404 });
    });
  });

  it("canPlayFromAyah is false when no reciter is selected", () => {
    const { result } = renderHook(() => usePlayFromAyah(1, "Al-Fatiha"));
    expect(result.current.canPlayFromAyah).toBe(false);
    expect(result.current.resolvedReciter).toBeNull();
  });

  it("canPlayFromAyah is true when last reciter supports timestamps for the surah", () => {
    useReaderPlayerStore.setState({ lastReciterId: "reciter-1", lastRewayatId: "rewayat-1" });
    const { result } = renderHook(() => usePlayFromAyah(1, "Al-Fatiha"));
    expect(result.current.canPlayFromAyah).toBe(true);
    expect(result.current.resolvedReciter?.rewayat.id).toBe("rewayat-1");
  });

  it("playFromAyah loads timestamps, seeks, and starts playback", async () => {
    useReaderPlayerStore.setState({ lastReciterId: "reciter-1", lastRewayatId: "rewayat-1" });
    const stopSpy = vi.fn();
    useWordAudioStore.setState({ stop: stopSpy });
    const updateQueue = vi.fn().mockResolvedValue(undefined);
    const seekTo = vi.fn();
    const pause = vi.fn();
    const play = vi.fn().mockResolvedValue(undefined);
    usePlayerStore.setState({ updateQueue, seekTo, pause, play } as never);

    const { result } = renderHook(() => usePlayFromAyah(1, "Al-Fatiha"));

    await act(async () => {
      await result.current.playFromAyah(sampleVerse);
    });

    expect(stopSpy).toHaveBeenCalled();
    expect(fetchBayaanMock).toHaveBeenCalledWith("audio-url?rewayat_id=rewayat-1&surah=1");
    expect(updateQueue).toHaveBeenCalledWith([
      expect.objectContaining({
        url: "https://cdn.example.com/custom/001.mp3",
        surahId: 1,
        title: "Al-Fatiha",
      }),
    ]);
    expect(pause).toHaveBeenCalled();
    expect(seekTo).toHaveBeenCalledWith(5000);
    expect(play).toHaveBeenCalled();
  });

  it("falls back to server URL when audio-url API fails", async () => {
    useReaderPlayerStore.setState({ lastReciterId: "reciter-1", lastRewayatId: "rewayat-1" });
    fetchBayaanMock.mockRejectedValue(new Error("network"));
    const updateQueue = vi.fn().mockResolvedValue(undefined);
    usePlayerStore.setState({
      updateQueue,
      seekTo: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
    } as never);

    const { result } = renderHook(() => usePlayFromAyah(1, "Al-Fatiha"));

    await act(async () => {
      await result.current.playFromAyah(sampleVerse);
    });

    await waitFor(() => {
      expect(updateQueue).toHaveBeenCalledWith([
        expect.objectContaining({ url: "https://cdn.example.com//001.mp3" }),
      ]);
    });
  });

  it("throws when no reciter is resolved", async () => {
    const { result } = renderHook(() => usePlayFromAyah(1, "Al-Fatiha"));
    await expect(result.current.playFromAyah(sampleVerse)).rejects.toThrow(
      "Choose a reciter from the header player first.",
    );
  });

  it("throws when timing data is missing for the verse", async () => {
    useReaderPlayerStore.setState({ lastReciterId: "reciter-1", lastRewayatId: "rewayat-1" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            rewayat_id: "rewayat-1",
            surah: 1,
            timestamps: [{ verse_key: "1:1", timestamp_from: 0, timestamp_to: 1000 }],
          },
        }),
        { status: 200 },
      ),
    );
    const { result } = renderHook(() => usePlayFromAyah(1, "Al-Fatiha"));
    await expect(result.current.playFromAyah(sampleVerse)).rejects.toThrow(
      "No timing data for verse 1:2.",
    );
  });
});
