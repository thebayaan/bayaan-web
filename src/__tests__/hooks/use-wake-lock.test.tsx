import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePlayerStore } from "@/stores/player-store";
import { useWakeLock } from "@/hooks/use-wake-lock";

interface MockSentinel {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: () => void;
}

function makeSentinel(): MockSentinel {
  const sentinel: MockSentinel = {
    released: false,
    release: vi.fn(async () => {
      sentinel.released = true;
    }),
    addEventListener: vi.fn(),
  };
  return sentinel;
}

describe("useWakeLock", () => {
  beforeEach(() => {
    usePlayerStore.setState({
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
  });

  it("requests a screen wake lock when isPlaying becomes true", async () => {
    const sentinel = makeSentinel();
    const request = vi.fn(async () => sentinel);
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request },
    });

    const { rerender } = renderHook(() => useWakeLock());
    await act(async () => {
      usePlayerStore.setState((s) => ({
        playback: { ...s.playback, isPlaying: true },
      }));
      rerender();
      await Promise.resolve();
    });

    expect(request).toHaveBeenCalledWith("screen");
  });

  it("releases the sentinel when isPlaying becomes false", async () => {
    const sentinel = makeSentinel();
    const request = vi.fn(async () => sentinel);
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request },
    });

    usePlayerStore.setState((s) => ({
      playback: { ...s.playback, isPlaying: true },
    }));

    const { rerender } = renderHook(() => useWakeLock());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      usePlayerStore.setState((s) => ({
        playback: { ...s.playback, isPlaying: false },
      }));
      rerender();
      await Promise.resolve();
    });

    expect(sentinel.release).toHaveBeenCalled();
  });

  it("no-ops gracefully when the Wake Lock API is missing", () => {
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: undefined,
    });
    usePlayerStore.setState((s) => ({
      playback: { ...s.playback, isPlaying: true },
    }));
    expect(() => renderHook(() => useWakeLock())).not.toThrow();
  });
});
