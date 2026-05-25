import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/hooks/use-audio-events", () => ({ useAudioEvents: vi.fn() }));
vi.mock("@/hooks/use-media-session", () => ({ useMediaSession: vi.fn() }));
vi.mock("@/hooks/use-wake-lock", () => ({ useWakeLock: vi.fn() }));
vi.mock("@/hooks/use-sleep-timer", () => ({ useSleepTimer: () => ({ remainingMs: null }) }));
vi.mock("@/hooks/use-recently-played-tracker", () => ({ useRecentlyPlayedTracker: vi.fn() }));

vi.mock("@/hooks/use-reciters", () => ({
  useReciters: () => ({
    reciters: [
      {
        id: "r-1",
        name: "Mishary Alafasy",
        slug: "mishary-alafasy",
        rewayat: [{ id: "rw-1", name: "hafs" }],
      },
    ],
    isLoading: false,
    featured: [],
  }),
}));

vi.mock("@/services/audio/audio-service", () => ({
  audioService: {
    setVolume: vi.fn(),
    setMuted: vi.fn(),
  },
}));

const buildTrack = () => ({
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
});

const playerState = {
  queue: { tracks: [buildTrack()], currentIndex: 0, shuffleOrder: null, shufflePosition: 0 },
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
  isLoading: false,
  play: vi.fn(),
  pause: vi.fn(),
  skipToNext: vi.fn(),
  skipToPrevious: vi.fn(),
  seekTo: vi.fn(),
  setRepeatMode: vi.fn(),
  toggleShuffle: vi.fn(),
  setRate: vi.fn(),
  updatePlayback: vi.fn(),
};

vi.mock("@/stores/player-store", () => ({
  usePlayerStore: Object.assign(
    (selector: (state: typeof playerState) => unknown) => selector({ ...playerState }),
    { getState: () => ({ ...playerState }) },
  ),
}));

import { BottomPlayerBar } from "@/components/player/bottom-player-bar";

describe("BottomPlayerBar", () => {
  beforeEach(() => {
    playerState.queue.tracks = [buildTrack()];
    playerState.queue.currentIndex = 0;
    playerState.playback.isPlaying = false;
    playerState.settings.rate = 1;
    vi.clearAllMocks();
  });

  it("renders empty state when no track is loaded", () => {
    playerState.queue.tracks = [];
    render(<BottomPlayerBar />);
    expect(screen.getByText("Select a reciter to start listening")).toBeInTheDocument();
  });

  it("renders track info when a track is loaded", () => {
    render(<BottomPlayerBar />);
    expect(screen.getAllByText("Al-Fatiha").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mishary Alafasy").length).toBeGreaterThan(0);
  });

  it("links the artist to the reciter page when slug is known", () => {
    render(<BottomPlayerBar />);
    expect(screen.getByRole("link", { name: "Mishary Alafasy" })).toHaveAttribute(
      "href",
      "/reciter/mishary-alafasy",
    );
  });

  it("renders play/pause button and toggles playback", async () => {
    const user = userEvent.setup();
    render(<BottomPlayerBar />);

    const playButton = screen.getByRole("button", { name: "Play" });
    await user.click(playButton);
    expect(playerState.play).toHaveBeenCalled();

    playerState.playback.isPlaying = true;
    render(<BottomPlayerBar />);
    const pauseButton = screen.getByRole("button", { name: "Pause" });
    await user.click(pauseButton);
    expect(playerState.pause).toHaveBeenCalled();
  });

  it("cycles playback rate from the rate button", async () => {
    const user = userEvent.setup();
    render(<BottomPlayerBar />);

    await user.click(screen.getByRole("button", { name: "Playback rate 1x" }));
    expect(playerState.setRate).toHaveBeenCalledWith(1.25);
  });

  it("exposes playback state via aria-live region for screen readers", () => {
    render(<BottomPlayerBar />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    expect(liveRegion).toHaveTextContent(/paused.*al-fatiha.*mishary alafasy/i);
  });
});
