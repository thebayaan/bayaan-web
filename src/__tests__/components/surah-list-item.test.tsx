import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { SurahListItem } from "@/components/surah-list-item";
import type { Reciter, Rewayat } from "@/types/reciter";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

const mockRewayat: Rewayat = {
  id: "rw1",
  reciter_id: "r1",
  name: "Hafs",
  style: "murattal",
  server: "https://cdn.example.com/audio",
  source_type: "mp3quran",
  surah_total: 1,
  surah_list: [1],
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

describe("SurahListItem", () => {
  const mockSurah = {
    id: 1,
    name: "Al-Faatiha",
    name_arabic: "الفاتحة",
    name_simple: "Al-Fatihah",
    revelation_place: "makkah" as const,
    revelation_order: 5,
    bismillah_pre: false,
    verses_count: 7,
    translated_name_english: "The Opening",
    pages: "1-1",
  };

  it("renders the surah name and the SurahNames glyph", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    expect(screen.getByText("Al-Faatiha")).toBeInTheDocument();
    // Surah 1 maps to U+E904 in the SurahNames font. The glyph is wrapped in
    // the "cover art" cell, so getAllByText finds both the span and its parent.
    expect(screen.getAllByText("").length).toBeGreaterThan(0);
  });

  it("shows the english meaning", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    expect(screen.getByText(/The Opening/)).toBeInTheDocument();
  });

  it("calls onPlay with the surah id when the row is clicked", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<SurahListItem surah={mockSurah} onPlay={onPlay} />, { wrapper });
    await user.click(screen.getByRole("button", { name: /play al-faatiha/i }));
    expect(onPlay).toHaveBeenCalledWith(1);
  });

  it("triggers onPlay when the row is activated with Enter", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<SurahListItem surah={mockSurah} onPlay={onPlay} />, { wrapper });
    const row = screen.getByRole("button", { name: /play al-faatiha/i });
    row.focus();
    await user.keyboard("{Enter}");
    expect(onPlay).toHaveBeenCalledWith(1);
  });

  it("renders the equalizer glyph when this row is the currently-playing track", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} isPlaying isCurrentTrack />, {
      wrapper,
    });
    expect(screen.getByLabelText("Currently playing")).toBeInTheDocument();
  });

  it("renders heart toggle and more-actions when actions are provided", () => {
    render(
      <SurahListItem
        surah={mockSurah}
        onPlay={vi.fn()}
        actions={{ reciter: mockReciter, rewayat: mockRewayat }}
      />,
      { wrapper },
    );
    expect(
      screen.getByRole("button", { name: /add al-faatiha to favorites/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /more actions for al-faatiha/i }),
    ).toBeInTheDocument();
  });

  it("does not render heart or more-actions when actions are omitted", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    expect(screen.queryByRole("button", { name: /favorites/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /more actions/i })).not.toBeInTheDocument();
  });

  it("clicking the heart does not trigger onPlay (no row bubble)", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(
      <SurahListItem
        surah={mockSurah}
        onPlay={onPlay}
        actions={{ reciter: mockReciter, rewayat: mockRewayat }}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: /add al-faatiha to favorites/i }));
    expect(onPlay).not.toHaveBeenCalled();
  });

  it("shows revelation place when actions are provided (desktop column)", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    expect(screen.getByText("Makkah")).toBeInTheDocument();
  });

  it("shows ayahs count in the metadata column", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    // Ayahs column shows the bare number — surrounding column header text is on the parent.
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
