import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/stores/player-store", () => ({
  usePlayerStore: Object.assign(
    (selector: (state: ReturnType<typeof buildState>) => unknown) => {
      const state = buildState();
      return selector(state);
    },
    { getState: vi.fn() },
  ),
}));

function buildState() {
  return {
    queue: {
      tracks: [
        {
          id: "t-1",
          title: "Al-Fatiha",
          artist: "Mishary Alafasy",
          artwork: "https://cdn.thebayaan.com/test.jpg",
          url: "https://cdn.thebayaan.com/001.mp3",
          duration: 120000,
          reciterId: "r-1",
          reciterName: "Mishary Alafasy",
          surahId: 1,
          rewayatId: "rw-1",
        },
      ],
      currentIndex: 0,
    },
    playback: {
      isPlaying: false,
      positionMs: 30000,
      durationMs: 120000,
      rate: 1,
      volume: 1,
      isMuted: false,
      currentTrackIndex: 0,
    },
    settings: {
      repeatMode: "none" as const,
      shuffle: false,
      rate: 1,
      sleepTimerMinutes: null,
    },
    play: vi.fn(),
    pause: vi.fn(),
    skipToNext: vi.fn(),
    skipToPrevious: vi.fn(),
    seekTo: vi.fn(),
    setRepeatMode: vi.fn(),
    toggleShuffle: vi.fn(),
    updatePlayback: vi.fn(),
  };
}

import { BottomPlayerBar } from "@/components/player/bottom-player-bar";

describe("BottomPlayerBar", () => {
  it("renders track info when a track is loaded", () => {
    render(<BottomPlayerBar />);
    expect(screen.getByText("Al-Fatiha")).toBeInTheDocument();
    expect(screen.getByText("Mishary Alafasy")).toBeInTheDocument();
  });

  it("renders play/pause button", () => {
    render(<BottomPlayerBar />);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });
});
