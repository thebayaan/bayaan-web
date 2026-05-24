import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePlayerStore } from "@/stores/player-store";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { ReciterCard } from "@/components/reciter-card";

describe("ReciterCard", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: { tracks: [], currentIndex: -1, shuffleOrder: null, shufflePosition: 0 },
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

  const mockReciter = {
    id: "r-1",
    name: "Mishary Alafasy",
    slug: "mishary-alafasy",
    image_url: "https://cdn.thebayaan.com/test.jpg",
    is_featured: true,
    rewayat: [
      {
        id: "rw-1",
        reciter_id: "r-1",
        name: "Hafs A'n Assem",
        style: "murattal" as const,
        server: "https://cdn.thebayaan.com/test",
        source_type: "bayaan",
        surah_total: 114,
        surah_list: [1, 2, 3],
        mp3quran_read_id: null,
        qdc_reciter_id: null,
      },
    ],
  };

  it("renders reciter name", () => {
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByText("Mishary Alafasy")).toBeInTheDocument();
  });

  it("renders reciter image", () => {
    render(<ReciterCard reciter={mockReciter} />);
    const img = screen.getByAltText("Mishary Alafasy");
    expect(img).toBeInTheDocument();
  });

  it("shows the rewayat name when there is exactly one", () => {
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByText("Hafs A'n Assem")).toBeInTheDocument();
  });

  it("shows a rewayat count when there are multiple", () => {
    const multi = {
      ...mockReciter,
      rewayat: [
        ...mockReciter.rewayat,
        {
          ...mockReciter.rewayat[0]!,
          id: "rw-2",
          name: "Warsh",
        },
      ],
    };
    render(<ReciterCard reciter={multi} />);
    expect(screen.getByText("2 rewayat")).toBeInTheDocument();
  });

  it("links to reciter profile", () => {
    render(<ReciterCard reciter={mockReciter} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/reciter/mishary-alafasy");
  });

  it("renders a play overlay button labeled with the reciter's name", () => {
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByRole("button", { name: /play mishary alafasy/i })).toBeInTheDocument();
  });

  it("clicking the play overlay loads a queue starting with surah 1", async () => {
    const user = userEvent.setup();
    render(<ReciterCard reciter={mockReciter} />);
    await user.click(screen.getByRole("button", { name: /play mishary alafasy/i }));
    await waitFor(() => {
      expect(usePlayerStore.getState().queue.tracks.length).toBeGreaterThan(0);
    });
    expect(usePlayerStore.getState().queue.tracks[0]?.reciterId).toBe("r-1");
    expect(usePlayerStore.getState().queue.tracks[0]?.surahId).toBe(1);
  });

  it("when this reciter is the active track, the button toggles to Pause", () => {
    usePlayerStore.setState({
      queue: {
        tracks: [
          {
            id: "t1",
            url: "u",
            title: "Al-Fatihah",
            artist: "Mishary Alafasy",
            artwork: "",
            duration: 60,
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
        isPlaying: true,
        currentTrackIndex: 0,
        positionMs: 0,
        durationMs: 60_000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByRole("button", { name: /pause mishary alafasy/i })).toBeInTheDocument();
  });
});
