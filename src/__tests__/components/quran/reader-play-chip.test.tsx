import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { ReaderPlayChip } from "@/components/quran/reader-play-chip";
import { server } from "@/__tests__/mocks/server";
import { usePlayerStore } from "@/stores/player-store";
import { useReaderPlayerStore } from "@/stores/reader-player-store";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

const mockReciter = {
  id: "rec-1",
  name: "Sample Reciter",
  slug: "sample-reciter",
  is_featured: true,
  image_url: "https://cdn.example.com/avatar.jpg",
  rewayat: [
    {
      id: "rw-1",
      reciter_id: "rec-1",
      name: "Hafs A'n Assem",
      style: "murattal",
      server: "https://cdn.example.com/audio",
      source_type: "mp3quran",
      surah_total: 114,
      surah_list: Array.from({ length: 114 }, (_, i) => i + 1),
      mp3quran_read_id: null,
      qdc_reciter_id: null,
    },
  ],
};

describe("ReaderPlayChip", () => {
  beforeEach(() => {
    useReaderPlayerStore.setState({ lastReciterId: null, lastRewayatId: null });
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
    server.use(
      http.get(`${API}/bayaan/reciters`, () =>
        HttpResponse.json({
          data: [mockReciter],
          pagination: { page: 1, limit: 200, total: 1 },
        }),
      ),
    );
  });

  it("with no remembered reciter, renders a 'Choose reciter' affordance", async () => {
    render(<ReaderPlayChip surahId={1} surahName="Al-Fatihah" />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Choose reciter")).toBeInTheDocument();
    });
  });

  it("clicking the play button when no reciter is selected opens the picker", async () => {
    const user = userEvent.setup();
    render(<ReaderPlayChip surahId={1} surahName="Al-Fatihah" />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Choose reciter")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /pick a reciter to play/i }));
    expect(screen.getByRole("dialog", { name: /choose a reciter/i })).toBeInTheDocument();
  });

  it("picking a reciter loads a one-track queue for the surah and persists the choice", async () => {
    const user = userEvent.setup();
    render(<ReaderPlayChip surahId={1} surahName="Al-Fatihah" />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Choose reciter")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /pick a reciter/i }));
    await user.click(screen.getByRole("button", { name: /sample reciter/i }));

    await waitFor(() => {
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(1);
    });
    expect(usePlayerStore.getState().queue.tracks[0]?.reciterId).toBe("rec-1");
    expect(usePlayerStore.getState().queue.tracks[0]?.surahId).toBe(1);
    expect(useReaderPlayerStore.getState().lastReciterId).toBe("rec-1");
  });

  it("after a reciter is remembered, the chip shows their name and a pause-aware play button", async () => {
    useReaderPlayerStore.setState({ lastReciterId: "rec-1", lastRewayatId: "rw-1" });
    render(<ReaderPlayChip surahId={1} surahName="Al-Fatihah" />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Sample Reciter")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /play al-fatihah by sample reciter/i }),
    ).toBeInTheDocument();
  });

  it("returns null when no reciter in the catalogue has this surah", async () => {
    server.use(
      http.get(`${API}/bayaan/reciters`, () =>
        HttpResponse.json({
          data: [
            {
              ...mockReciter,
              rewayat: [
                {
                  ...mockReciter.rewayat[0],
                  surah_list: [114], // doesn't include surah 1
                  surah_total: 1,
                },
              ],
            },
          ],
          pagination: { page: 1, limit: 200, total: 1 },
        }),
      ),
    );
    const { container } = render(<ReaderPlayChip surahId={1} surahName="Al-Fatihah" />, {
      wrapper,
    });
    await waitFor(() => {
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    });
    expect(container.firstChild).toBeNull();
  });
});
