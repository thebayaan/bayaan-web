import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SurahListItem } from "@/components/surah-list-item";

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
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />);
    expect(screen.getByText("Al-Faatiha")).toBeInTheDocument();
    // Surah 1 maps to U+E904 in the SurahNames font
    expect(screen.getByText("\uE904")).toBeInTheDocument();
  });

  it("shows ayah count and english meaning", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />);
    expect(screen.getByText(/The Opening/)).toBeInTheDocument();
    expect(screen.getByText(/7 ayahs/i)).toBeInTheDocument();
  });

  it("calls onPlay with the surah id when the row is clicked", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<SurahListItem surah={mockSurah} onPlay={onPlay} />);
    await user.click(screen.getByRole("button"));
    expect(onPlay).toHaveBeenCalledWith(1);
  });

  it("renders the equalizer glyph when this row is the currently-playing track", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} isPlaying isCurrentTrack />);
    expect(screen.getByLabelText("Currently playing")).toBeInTheDocument();
  });
});
