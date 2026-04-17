import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePlayerStore } from "@/stores/player-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { audioService } from "@/services/audio/audio-service";

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

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

import { ContinueWhereYouLeftOff } from "@/components/home/continue-where-you-left-off";

describe("ContinueWhereYouLeftOff", () => {
  beforeEach(() => {
    usePlayerStore.setState(usePlayerStore.getInitialState());
    useReadingSettingsStore.setState({
      mushafPage: 1,
      lastReadSurahId: null,
      lastReadSurahAt: null,
    });
    vi.mocked(audioService.play).mockClear();
  });

  it("renders nothing when there's no listening or reading state", () => {
    const { container } = render(<ContinueWhereYouLeftOff />);
    expect(container.textContent).toBe("");
  });

  it("shows the listening card with track + position and resumes on click", async () => {
    const user = userEvent.setup();
    usePlayerStore.setState({
      queue: {
        tracks: [
          {
            id: "t-1",
            title: "Al-Fatiha",
            artist: "Mishary Alafasy",
            artwork: "https://cdn.thebayaan.com/mishary.jpg",
            url: "https://cdn.thebayaan.com/001.mp3",
            duration: 120000,
            reciterId: "r-1",
            reciterName: "Mishary Alafasy",
            surahId: 1,
            rewayatId: "rw-1",
          },
        ],
        currentIndex: 0,
        shuffleOrder: null,
        shufflePosition: 0,
      },
      playback: {
        isPlaying: false,
        positionMs: 45000,
        durationMs: 120000,
        rate: 1,
        volume: 1,
        isMuted: false,
        currentTrackIndex: 0,
      },
    });

    render(<ContinueWhereYouLeftOff />);
    await waitFor(() => {
      expect(screen.getByText("Al-Fatiha")).toBeInTheDocument();
    });
    expect(screen.getByText(/paused at 0:45/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /resume/i }));
    await waitFor(() => {
      expect(audioService.play).toHaveBeenCalled();
    });
  });

  it("shows the mushaf-page card when only mushafPage > 1", async () => {
    useReadingSettingsStore.setState({ mushafPage: 42 });
    render(<ContinueWhereYouLeftOff />);
    await waitFor(() => {
      expect(screen.getByText(/mushaf page 42/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /continue reading/i })).toHaveAttribute(
      "href",
      "/quran",
    );
  });

  it("prefers the last-read surah card with deep link to that surah", async () => {
    useReadingSettingsStore.setState({
      mushafPage: 42,
      lastReadSurahId: 2,
      lastReadSurahAt: "2026-04-16T00:00:00Z",
    });
    render(<ContinueWhereYouLeftOff />);
    await waitFor(() => {
      expect(screen.getByText(/Surah Al-Baqarah/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/mushaf page 42/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue reading/i })).toHaveAttribute(
      "href",
      "/quran/2",
    );
  });
});
