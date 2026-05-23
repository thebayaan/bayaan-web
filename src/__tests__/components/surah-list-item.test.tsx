import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { SurahListItem } from "@/components/surah-list-item";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

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
  };

  it("renders the surah name and the SurahNames glyph", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    expect(screen.getByText("Al-Faatiha")).toBeInTheDocument();
    // Surah 1 maps to U+E904 in the SurahNames font
    expect(screen.getByText("")).toBeInTheDocument();
  });

  it("shows ayah count and english meaning", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    expect(screen.getByText(/The Opening/)).toBeInTheDocument();
    expect(screen.getByText(/7 ayahs/i)).toBeInTheDocument();
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

  it("renders an Add-to-playlist button when playlistItem is provided", () => {
    render(
      <SurahListItem
        surah={mockSurah}
        onPlay={vi.fn()}
        playlistItem={{ reciter_id: "r1", rewayat_id: "rw1" }}
      />,
      { wrapper },
    );
    expect(
      screen.getByRole("button", { name: /add al-faatiha to a playlist/i }),
    ).toBeInTheDocument();
  });

  it("does not render an Add-to-playlist button when playlistItem is omitted", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />, { wrapper });
    expect(screen.queryByRole("button", { name: /add .* to a playlist/i })).not.toBeInTheDocument();
  });

  it("clicking the Add-to-playlist button does not trigger onPlay (no row bubble)", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(
      <SurahListItem
        surah={mockSurah}
        onPlay={onPlay}
        playlistItem={{ reciter_id: "r1", rewayat_id: "rw1" }}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: /add al-faatiha to a playlist/i }));
    expect(onPlay).not.toHaveBeenCalled();
  });
});
