import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { VerseActions } from "@/components/quran/verse-actions";
import { server } from "@/__tests__/mocks/server";
import { useReaderPlayerStore } from "@/stores/reader-player-store";
import { usePlayerStore } from "@/stores/player-store";
import type { QcfVerse } from "@/types/quran-api";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

const mockReciter = {
  id: "reciter-1",
  name: "Sample Reciter",
  slug: "sample-reciter",
  is_featured: true,
  image_url: "https://cdn.example.com/avatar.jpg",
  rewayat: [
    {
      id: "rewayat-1",
      reciter_id: "reciter-1",
      name: "Hafs",
      style: "murattal",
      server: "https://cdn.example.com/",
      source_type: "mp3quran",
      surah_total: 114,
      surah_list: [1, 2, 3],
      mp3quran_read_id: 11,
      qdc_reciter_id: null,
      has_timestamps: true,
    },
  ],
};

const sampleVerse: QcfVerse = {
  id: 2,
  verse_number: 2,
  verse_key: "1:2",
  hizb_number: 1,
  rub_el_hizb_number: 1,
  ruku_number: 1,
  manzil_number: 1,
  sajdah_number: null,
  page_number: 1,
  juz_number: 1,
  chapter_id: 1,
  text_uthmani: "x",
  words: [],
};

describe("VerseActions", () => {
  beforeEach(() => {
    useReaderPlayerStore.setState({ lastReciterId: null, lastRewayatId: null });
    usePlayerStore.setState({
      queue: { tracks: [], currentIndex: 0, shuffleOrder: null, shufflePosition: 0 },
      playback: {
        isPlaying: false,
        currentTrackIndex: -1,
        positionMs: 0,
        durationMs: 0,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
      updateQueue: vi.fn().mockResolvedValue(undefined),
      seekTo: vi.fn(),
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
    } as never);
    server.use(
      http.get(`${API}/bayaan/reciters`, () =>
        HttpResponse.json({
          data: [mockReciter],
          pagination: { page: 1, limit: 200, total: 1 },
        }),
      ),
      http.get(`${API}/timestamps/:rewayatId/:surah`, () =>
        HttpResponse.json({
          data: {
            rewayat_id: "rewayat-1",
            surah: 1,
            timestamps: [
              { verse_key: "1:1", timestamp_from: 0, timestamp_to: 5000 },
              { verse_key: "1:2", timestamp_from: 5000, timestamp_to: 10000 },
            ],
          },
        }),
      ),
      http.get(`${API}/bayaan/audio-url`, () =>
        HttpResponse.json({ data: { url: "https://cdn.example.com/custom/001.mp3" } }),
      ),
    );
  });

  it("opens the reciter picker when play is pressed without a remembered reciter", async () => {
    const user = userEvent.setup();
    render(<VerseActions verse={sampleVerse} surahId={1} surahName="Al-Fatiha" />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /play from 1:2 — choose a reciter/i }),
      ).not.toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: /play from 1:2 — choose a reciter/i }));
    expect(screen.getByRole("dialog", { name: /choose a reciter/i })).toBeInTheDocument();
  });

  it("starts playback from the picked reciter and ayah", async () => {
    const user = userEvent.setup();
    render(<VerseActions verse={sampleVerse} surahId={1} surahName="Al-Fatiha" />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /play from 1:2 — choose a reciter/i }),
      ).not.toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: /play from 1:2 — choose a reciter/i }));
    await user.click(screen.getByRole("button", { name: /sample reciter/i }));

    await waitFor(() => {
      expect(usePlayerStore.getState().updateQueue).toHaveBeenCalled();
    });
    expect(usePlayerStore.getState().seekTo).toHaveBeenCalledWith(5000);
    expect(useReaderPlayerStore.getState().lastReciterId).toBe("reciter-1");
  });
});
