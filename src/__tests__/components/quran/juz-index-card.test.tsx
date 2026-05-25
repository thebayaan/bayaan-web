import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JuzIndexCard } from "@/components/quran/juz-index-card";
import { getJuzIndexEntries } from "@/data/juz-data";
import { getMushafReaderPath } from "@/lib/mushaf-navigation";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("JuzIndexCard", () => {
  const entry = getJuzIndexEntries()[1]!;

  beforeEach(() => {
    pushMock.mockClear();
    useReadingSettingsStore.setState({ mushafPage: 1, viewMode: "reading", mushafJumpSeq: 0 });
  });

  it("renders juz number and label", () => {
    render(<JuzIndexCard entry={entry} />);
    expect(screen.getByText(String(entry.juz))).toBeInTheDocument();
    expect(screen.getByText(entry.label)).toBeInTheDocument();
  });

  it("shows start page and verse metadata", () => {
    render(<JuzIndexCard entry={entry} />);
    expect(
      screen.getByText(`Page ${entry.startPage} · ${entry.startVerseKey}`),
    ).toBeInTheDocument();
    const [surahId, ayah] = entry.startVerseKey.split(":");
    expect(screen.getByText(`${surahId}:${ayah}`)).toBeInTheDocument();
  });

  it("links to the surah reader for the juz start page", () => {
    render(<JuzIndexCard entry={entry} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", getMushafReaderPath(entry.startPage));
  });

  it("navigates to the juz start page on click", () => {
    render(<JuzIndexCard entry={entry} />);
    fireEvent.click(screen.getByRole("link"));
    expect(useReadingSettingsStore.getState().mushafPage).toBe(entry.startPage);
    expect(useReadingSettingsStore.getState().viewMode).toBe("mushaf");
    expect(pushMock).toHaveBeenCalledWith(getMushafReaderPath(entry.startPage));
  });
});
