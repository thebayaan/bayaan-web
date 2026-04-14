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

  it("renders surah number, name, and translation", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Al-Faatiha")).toBeInTheDocument();
    expect(screen.getByText("The Opening")).toBeInTheDocument();
  });

  it("shows verse count", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />);
    expect(screen.getByText(/7 verses/i)).toBeInTheDocument();
  });

  it("calls onPlay when play button clicked", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<SurahListItem surah={mockSurah} onPlay={onPlay} />);
    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(onPlay).toHaveBeenCalledWith(1);
  });

  it("shows currently playing indicator", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} isPlaying />);
    // When playing, the item should have visual distinction
    const item = screen.getByText("Al-Faatiha").closest("div");
    expect(item?.className).toContain("text-foreground");
  });
});
