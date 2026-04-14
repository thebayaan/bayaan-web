import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock audio service before importing store
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

import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/audio";

const mockTrack: Track = {
  id: "t-1",
  url: "https://cdn.thebayaan.com/quran/recitations/test/001.mp3",
  title: "Al-Fatiha",
  artist: "Mishary Alafasy",
  artwork: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
  duration: 120000,
  reciterId: "r-1",
  reciterName: "Mishary Alafasy",
  surahId: 1,
  rewayatId: "rw-1",
};

const mockTrack2: Track = {
  ...mockTrack,
  id: "t-2",
  title: "Al-Baqarah",
  surahId: 2,
  url: "https://cdn.thebayaan.com/quran/recitations/test/002.mp3",
};

describe("player-store", () => {
  beforeEach(() => {
    usePlayerStore.setState(usePlayerStore.getInitialState());
  });

  describe("queue management", () => {
    it("starts with empty queue", () => {
      const state = usePlayerStore.getState();
      expect(state.queue.tracks).toHaveLength(0);
      expect(state.queue.currentIndex).toBe(-1);
    });

    it("updates queue with tracks", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack, mockTrack2]);
      const state = usePlayerStore.getState();
      expect(state.queue.tracks).toHaveLength(2);
      expect(state.queue.currentIndex).toBe(0);
    });

    it("adds tracks to queue", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack]);
      await usePlayerStore.getState().addToQueue([mockTrack2]);
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(2);
    });

    it("removes tracks from queue by index", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack, mockTrack2]);
      usePlayerStore.getState().removeFromQueue([1]);
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(1);
      expect(usePlayerStore.getState().queue.tracks[0]?.id).toBe("t-1");
    });

    it("moves tracks in queue", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack, mockTrack2]);
      usePlayerStore.getState().moveInQueue(0, 1);
      const tracks = usePlayerStore.getState().queue.tracks;
      expect(tracks[0]?.id).toBe("t-2");
      expect(tracks[1]?.id).toBe("t-1");
    });
  });

  describe("playback settings", () => {
    it("defaults to no repeat", () => {
      expect(usePlayerStore.getState().settings.repeatMode).toBe("none");
    });

    it("cycles repeat mode", () => {
      usePlayerStore.getState().setRepeatMode("queue");
      expect(usePlayerStore.getState().settings.repeatMode).toBe("queue");
      usePlayerStore.getState().setRepeatMode("track");
      expect(usePlayerStore.getState().settings.repeatMode).toBe("track");
    });

    it("toggles shuffle", () => {
      expect(usePlayerStore.getState().settings.shuffle).toBe(false);
      usePlayerStore.getState().toggleShuffle();
      expect(usePlayerStore.getState().settings.shuffle).toBe(true);
    });

    it("sets sleep timer", () => {
      usePlayerStore.getState().setSleepTimer(30);
      expect(usePlayerStore.getState().settings.sleepTimerMinutes).toBe(30);
    });
  });

  describe("playback state", () => {
    it("updates playback position", () => {
      usePlayerStore.getState().updatePlayback({ positionMs: 5000 });
      expect(usePlayerStore.getState().playback.positionMs).toBe(5000);
    });

    it("updates volume", () => {
      usePlayerStore.getState().updatePlayback({ volume: 0.5 });
      expect(usePlayerStore.getState().playback.volume).toBe(0.5);
    });
  });

  describe("reset", () => {
    it("resets to initial state", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack]);
      usePlayerStore.getState().reset();
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(0);
    });
  });
});
