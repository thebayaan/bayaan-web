import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JuzIndexCard } from "@/components/quran/juz-index-card";
import { getJuzIndexEntries } from "@/data/juz-data";

describe("JuzIndexCard", () => {
  const entry = getJuzIndexEntries()[1]!;

  it("renders juz number and label", () => {
    render(<JuzIndexCard entry={entry} />);
    expect(screen.getByText(String(entry.juz))).toBeInTheDocument();
    expect(screen.getByText(entry.label)).toBeInTheDocument();
  });

  it("shows start page and verse metadata", () => {
    render(<JuzIndexCard entry={entry} />);
    expect(screen.getByText(`Page ${entry.startPage} · ${entry.startVerseKey}`)).toBeInTheDocument();
    const [surahId, ayah] = entry.startVerseKey.split(":");
    expect(screen.getByText(`${surahId}:${ayah}`)).toBeInTheDocument();
  });

  it("links to the mushaf start page", () => {
    render(<JuzIndexCard entry={entry} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", `/mushaf/${entry.startPage}`);
  });
});
