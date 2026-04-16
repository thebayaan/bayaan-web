import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePlayerStore } from "@/stores/player-store";
import { useMediaSession } from "@/hooks/use-media-session";

type ActionHandler = (details: { seekTime?: number; seekOffset?: number }) => void;

function installMediaSessionMock() {
  const handlers: Record<string, ActionHandler | null> = {};
  const setActionHandler = vi.fn((action: string, handler: ActionHandler | null) => {
    handlers[action] = handler;
  });
  const setPositionState = vi.fn();
  Object.defineProperty(navigator, "mediaSession", {
    configurable: true,
    value: {
      metadata: null,
      playbackState: "none",
      setActionHandler,
      setPositionState,
    },
  });
  return { handlers, setActionHandler, setPositionState };
}

describe("useMediaSession", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: { tracks: [], currentIndex: -1 },
      playback: {
        isPlaying: false,
        currentTrackIndex: -1,
        positionMs: 15000,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });
  });

  it("registers seekto handler that forwards to seekTo in ms", () => {
    const { handlers } = installMediaSessionMock();
    const seekSpy = vi.fn();
    usePlayerStore.setState((s) => ({ ...s, seekTo: seekSpy }) as never);
    renderHook(() => useMediaSession());

    handlers["seekto"]?.({ seekTime: 42 });
    expect(seekSpy).toHaveBeenCalledWith(42_000);
  });

  it("seekforward advances by 10s by default", () => {
    const { handlers } = installMediaSessionMock();
    const seekSpy = vi.fn();
    usePlayerStore.setState((s) => ({ ...s, seekTo: seekSpy }) as never);
    renderHook(() => useMediaSession());

    handlers["seekforward"]?.({});
    expect(seekSpy).toHaveBeenCalledWith(25_000);
  });

  it("seekbackward clamps at zero", () => {
    const { handlers } = installMediaSessionMock();
    const seekSpy = vi.fn();
    usePlayerStore.setState(
      (s) =>
        ({
          ...s,
          seekTo: seekSpy,
          playback: { ...s.playback, positionMs: 5000 },
        }) as never,
    );
    renderHook(() => useMediaSession());

    handlers["seekbackward"]?.({});
    expect(seekSpy).toHaveBeenCalledWith(0);
  });

  it("calls setPositionState with seconds when duration is positive", async () => {
    const { setPositionState } = installMediaSessionMock();
    renderHook(() => useMediaSession());
    await act(async () => {
      await Promise.resolve();
    });
    expect(setPositionState).toHaveBeenCalledWith({
      duration: 60,
      position: 15,
      playbackRate: 1,
    });
  });
});
