import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SurahIndexCard } from "@/components/quran/surah-index-card";
import type { Surah } from "@/types/quran";

const surah: Surah = {
  id: 2,
  name: "Al-Baqarah",
  name_simple: "Al-Baqarah",
  name_arabic: "البقرة",
  translated_name_english: "The Cow",
  verses_count: 286,
  revelation_place: "madinah",
  revelation_order: 87,
  bismillah_pre: true,
  pages: "2-49",
};

describe("SurahIndexCard", () => {
  it("renders the padded index", () => {
    render(<SurahIndexCard surah={surah} />);
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("renders the transliteration and meaning", () => {
    render(<SurahIndexCard surah={surah} />);
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByText(/The Cow/)).toBeInTheDocument();
  });

  it("renders the SurahNames glyph", () => {
    render(<SurahIndexCard surah={surah} />);
    // Surah 2 maps to U+E905 in the SurahNames font
    expect(screen.getByText("\uE905")).toBeInTheDocument();
  });

  it("links to the surah reader", () => {
    render(<SurahIndexCard surah={surah} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/quran/2");
  });
});
