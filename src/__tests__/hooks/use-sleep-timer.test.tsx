import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSleepTimer } from "@/hooks/use-sleep-timer";
import { usePlayerStore } from "@/stores/player-store";

describe("useSleepTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePlayerStore.setState({
      queue: { tracks: [], currentIndex: -1, shuffleOrder: null, shufflePosition: 0 },
      playback: {
        isPlaying: true,
        currentTrackIndex: -1,
        positionMs: 0,
        durationMs: 0,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
      settings: {
        repeatMode: "none",
        shuffle: false,
        rate: 1,
        sleepTimerMinutes: null,
        sleepTimerEndsAt: null,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null remaining when no timer is set", () => {
    const { result } = renderHook(() => useSleepTimer());
    expect(result.current.remainingMs).toBeNull();
  });

  it("counts down once setSleepTimer is called", () => {
    const { result } = renderHook(() => useSleepTimer());
    act(() => {
      usePlayerStore.getState().setSleepTimer(15);
    });
    // 15 minutes = 900_000 ms; allow small jitter.
    expect(result.current.remainingMs).toBeGreaterThan(15 * 60_000 - 1000);
    expect(result.current.remainingMs).toBeLessThanOrEqual(15 * 60_000);
  });

  it("auto-pauses playback when the deadline is reached and clears the timer", () => {
    renderHook(() => useSleepTimer());
    act(() => {
      usePlayerStore.getState().setSleepTimer(1);
    });
    expect(usePlayerStore.getState().settings.sleepTimerMinutes).toBe(1);
    expect(usePlayerStore.getState().playback.isPlaying).toBe(true);

    // Advance past the 1-minute mark and let the per-second interval fire.
    act(() => {
      vi.advanceTimersByTime(61 * 1000);
    });

    expect(usePlayerStore.getState().playback.isPlaying).toBe(false);
    expect(usePlayerStore.getState().settings.sleepTimerMinutes).toBeNull();
    expect(usePlayerStore.getState().settings.sleepTimerEndsAt).toBeNull();
  });
});
