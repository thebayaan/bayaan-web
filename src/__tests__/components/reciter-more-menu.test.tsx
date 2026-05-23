import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReciterMoreMenu } from "@/components/reciter-more-menu";
import type { Reciter, Rewayat } from "@/types/reciter";
import { usePlayerStore } from "@/stores/player-store";

const mockRewayat: Rewayat = {
  id: "rw1",
  reciter_id: "r1",
  name: "Hafs A'n Assem",
  style: "murattal",
  server: "https://cdn.example.com/audio",
  source_type: "mp3quran",
  surah_total: 2,
  surah_list: [1, 2],
  mp3quran_read_id: null,
  qdc_reciter_id: null,
};

const mockReciter: Reciter = {
  id: "r1",
  name: "Test Reciter",
  slug: "test-reciter",
  is_featured: false,
  rewayat: [mockRewayat],
};

const surahNameMap: Record<number, string> = { 1: "Al-Fatihah", 2: "Al-Baqarah" };

describe("ReciterMoreMenu", () => {
  beforeEach(() => {
    // Reset the persisted player store between tests.
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

  it("opens the menu when the More button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ReciterMoreMenu reciter={mockReciter} rewayat={mockRewayat} surahNameMap={surahNameMap} />,
    );
    const trigger = screen.getByRole("button", { name: /more actions/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /add all to queue/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /copy link/i })).toBeInTheDocument();
  });

  it("Copy link triggers the 'Link copied' live-region announcement", async () => {
    // We don't intercept navigator.clipboard here — jsdom 29's built-in
    // Clipboard impl resolves writeText to a no-op success, which is enough
    // to drive the component past the await. The behavior under test is
    // that the user gets a "Link copied" status announcement after pressing
    // the menu item; the exact URL contents are covered by the share-urls
    // unit tests.
    const user = userEvent.setup();
    render(
      <ReciterMoreMenu reciter={mockReciter} rewayat={mockRewayat} surahNameMap={surahNameMap} />,
    );
    await user.click(screen.getByRole("button", { name: /more actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /copy link/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/link copied to clipboard/i);
    });
  });

  it("Add all to queue appends every surah from the selected rewayat", async () => {
    const user = userEvent.setup();
    render(
      <ReciterMoreMenu reciter={mockReciter} rewayat={mockRewayat} surahNameMap={surahNameMap} />,
    );
    await user.click(screen.getByRole("button", { name: /more actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /add all to queue/i }));

    await waitFor(() => {
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(2);
    });
    const surahIds = usePlayerStore.getState().queue.tracks.map((t) => t.surahId);
    expect(surahIds).toEqual([1, 2]);
  });

  it("Add all to queue is disabled when no rewayat is provided", async () => {
    const user = userEvent.setup();
    render(
      <ReciterMoreMenu reciter={mockReciter} rewayat={undefined} surahNameMap={surahNameMap} />,
    );
    await user.click(screen.getByRole("button", { name: /more actions/i }));
    expect(screen.getByRole("menuitem", { name: /add all to queue/i })).toBeDisabled();
  });

  it("Escape closes the menu and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <ReciterMoreMenu reciter={mockReciter} rewayat={mockRewayat} surahNameMap={surahNameMap} />,
    );
    const trigger = screen.getByRole("button", { name: /more actions/i });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
