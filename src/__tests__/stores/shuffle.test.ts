import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/services/audio/audio-service", () => ({
  audioService: {
    load: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    seek: vi.fn(),
    setRate: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    getCurrentTime: vi.fn(() => 0),
    getDuration: vi.fn(() => 120),
    getIsPlaying: vi.fn(() => false),
    getVolume: vi.fn(() => 1),
    getIsMuted: vi.fn(() => false),
    on: vi.fn(() => vi.fn()),
    cleanup: vi.fn(),
  },
}));

vi.mock("@/services/audio/audio-coordinator", () => ({
  audioCoordinator: {
    mainWillPlay: vi.fn(),
    sourceDidStop: vi.fn(),
    registerPauseHandler: vi.fn(),
  },
}));

import { usePlayerStore, shuffleIndices } from "@/stores/player-store";
import type { Track } from "@/types/audio";

function trackAt(i: number): Track {
  return {
    id: `t-${i}`,
    url: `https://cdn.thebayaan.com/quran/recitations/test/${String(i).padStart(3, "0")}.mp3`,
    title: `Track ${i}`,
    artist: "Test",
    artwork: "",
    duration: 120000,
    reciterId: "r-1",
    reciterName: "Test",
    surahId: i,
    rewayatId: "rw-1",
  };
}

describe("shuffleIndices", () => {
  it("returns every index exactly once", () => {
    const sorted = [...shuffleIndices(10)].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("pins the requested index to position 0", () => {
    for (let trial = 0; trial < 20; trial++) {
      expect(shuffleIndices(10, 5)[0]).toBe(5);
    }
  });

  it("handles length 0 and 1", () => {
    expect(shuffleIndices(0)).toEqual([]);
    expect(shuffleIndices(1)).toEqual([0]);
  });
});

describe("shuffle in player-store", () => {
  beforeEach(() => {
    usePlayerStore.setState(usePlayerStore.getInitialState());
  });

  it("toggleShuffle builds an order pinned to the current track", async () => {
    const tracks = [trackAt(0), trackAt(1), trackAt(2), trackAt(3), trackAt(4)];
    await usePlayerStore.getState().updateQueue(tracks, 2);
    usePlayerStore.getState().toggleShuffle();
    const { queue } = usePlayerStore.getState();
    expect(queue.shuffleOrder).not.toBeNull();
    expect(queue.shuffleOrder).toHaveLength(5);
    expect(queue.shuffleOrder![0]).toBe(2);
    expect(queue.shufflePosition).toBe(0);
  });

  it("toggleShuffle off drops the order", async () => {
    await usePlayerStore.getState().updateQueue([trackAt(0), trackAt(1)], 0);
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().queue.shuffleOrder).not.toBeNull();
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().queue.shuffleOrder).toBeNull();
  });

  it("skipToNext walks the permutation when shuffle is on", async () => {
    const tracks = [trackAt(0), trackAt(1), trackAt(2), trackAt(3)];
    await usePlayerStore.getState().updateQueue(tracks, 0);
    usePlayerStore.getState().toggleShuffle();
    const { shuffleOrder } = usePlayerStore.getState().queue;
    await usePlayerStore.getState().skipToNext();
    const state = usePlayerStore.getState();
    expect(state.queue.shufflePosition).toBe(1);
    expect(state.queue.currentIndex).toBe(shuffleOrder![1]);
  });

  it("skipToPrevious walks backward through the permutation", async () => {
    const tracks = [trackAt(0), trackAt(1), trackAt(2), trackAt(3)];
    await usePlayerStore.getState().updateQueue(tracks, 0);
    usePlayerStore.getState().toggleShuffle();
    await usePlayerStore.getState().skipToNext();
    await usePlayerStore.getState().skipToNext();
    expect(usePlayerStore.getState().queue.shufflePosition).toBe(2);
    // ensure skipToPrevious doesn't just restart the track
    usePlayerStore.setState((s) => ({
      playback: { ...s.playback, positionMs: 0 },
    }));
    await usePlayerStore.getState().skipToPrevious();
    expect(usePlayerStore.getState().queue.shufflePosition).toBe(1);
  });

  it("re-shuffles at the end when repeatMode is queue", async () => {
    const tracks = [trackAt(0), trackAt(1), trackAt(2)];
    await usePlayerStore.getState().updateQueue(tracks, 0);
    usePlayerStore.getState().toggleShuffle();
    usePlayerStore.getState().setRepeatMode("queue");
    await usePlayerStore.getState().skipToNext();
    await usePlayerStore.getState().skipToNext();
    // Next skip should re-shuffle instead of stopping.
    await usePlayerStore.getState().skipToNext();
    const state = usePlayerStore.getState();
    expect(state.playback.isPlaying).toBe(true);
    expect(state.queue.shufflePosition).toBe(1);
  });

  it("sequential skipToNext is unchanged when shuffle is off", async () => {
    const tracks = [trackAt(0), trackAt(1), trackAt(2)];
    await usePlayerStore.getState().updateQueue(tracks, 0);
    await usePlayerStore.getState().skipToNext();
    expect(usePlayerStore.getState().queue.currentIndex).toBe(1);
    await usePlayerStore.getState().skipToNext();
    expect(usePlayerStore.getState().queue.currentIndex).toBe(2);
  });
});
