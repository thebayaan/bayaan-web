import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAyahTracker } from "@/hooks/use-ayah-tracker";
import { usePlayerStore } from "@/stores/player-store";
import { useAyahTrackerStore } from "@/stores/ayah-tracker-store";

describe("useAyahTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAyahTrackerStore.getState().clear();
    usePlayerStore.setState({
      playback: {
        isPlaying: false,
        currentTrackIndex: 0,
        positionMs: 0,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears active verse when timestamps are empty", () => {
    useAyahTrackerStore.getState().setActiveVerseKey("1:1");
    renderHook(() => useAyahTracker());
    expect(useAyahTrackerStore.getState().activeVerseKey).toBeNull();
  });

  it("sets active verse from playback position while playing", () => {
    useAyahTrackerStore.getState().setTimestamps("rw:1", 1, [
      { verse_key: "1:1", timestamp_from: 0, timestamp_to: 5000 },
      { verse_key: "1:2", timestamp_from: 5000, timestamp_to: 10000 },
    ]);
    usePlayerStore.setState({
      playback: {
        isPlaying: true,
        currentTrackIndex: 0,
        positionMs: 6000,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });

    renderHook(() => useAyahTracker());
    expect(useAyahTrackerStore.getState().activeVerseKey).toBe("1:2");
  });

  it("polls playback position on an interval", () => {
    useAyahTrackerStore.getState().setTimestamps("rw:1", 1, [
      { verse_key: "1:1", timestamp_from: 0, timestamp_to: 5000 },
      { verse_key: "1:2", timestamp_from: 5000, timestamp_to: 10000 },
    ]);
    usePlayerStore.setState({
      playback: {
        isPlaying: true,
        currentTrackIndex: 0,
        positionMs: 1000,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });

    renderHook(() => useAyahTracker());
    expect(useAyahTrackerStore.getState().activeVerseKey).toBe("1:1");

    act(() => {
      usePlayerStore.setState((s) => ({
        playback: { ...s.playback, positionMs: 7000 },
      }));
      vi.advanceTimersByTime(200);
    });

    expect(useAyahTrackerStore.getState().activeVerseKey).toBe("1:2");
  });

  it("does not poll when playback is paused", () => {
    useAyahTrackerStore
      .getState()
      .setTimestamps("rw:1", 1, [{ verse_key: "1:1", timestamp_from: 0, timestamp_to: 5000 }]);
    usePlayerStore.setState({
      playback: {
        isPlaying: false,
        currentTrackIndex: 0,
        positionMs: 1000,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });

    renderHook(() => useAyahTracker());
    expect(useAyahTrackerStore.getState().activeVerseKey).toBeNull();
  });
});
