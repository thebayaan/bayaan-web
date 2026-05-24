import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { QuranWord } from "@/components/quran/quran-word";
import type { QcfWord } from "@/types/quran-api";

const mockWord: QcfWord = {
  id: 1,
  position: 1,
  audio_url: null,
  char_type_name: "word",
  code_v2: "\ufc41",
  page_number: 1,
  line_number: 1,
  text_uthmani: "بِسْمِ",
  text_imlaei_simple: "bism",
  qpc_uthmani_hafs: "بِسْمِ",
  verse_key: "1:1",
  verse_id: 1,
  location: "1:1:1",
};

describe("QuranWord", () => {
  it("renders fallback text when font not loaded", () => {
    const { container } = render(
      <QuranWord
        word={mockWord}
        fontResolver={{ isPageFontLoaded: () => false, getFontFamily: () => "UthmanicHafs" }}
      />,
    );
    expect(container.querySelector("span")?.textContent).toBe("بِسْمِ");
  });

  it("renders glyph code when font loaded", () => {
    const { container } = render(
      <QuranWord
        word={mockWord}
        fontResolver={{ isPageFontLoaded: () => true, getFontFamily: () => "p1-v2" }}
      />,
    );
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("\ufc41");
    expect(span?.style.fontFamily).toBe("p1-v2");
  });

  it("uses the font for the word's page, not a shared page", () => {
    const wordOnPage3: QcfWord = { ...mockWord, page_number: 3, code_v2: "\ufc99" };
    const { container } = render(
      <QuranWord
        word={wordOnPage3}
        fontResolver={{
          isPageFontLoaded: (page) => page === 2,
          getFontFamily: (page) => (page === 2 ? "p2-v2" : "UthmanicHafs"),
        }}
      />,
    );
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("بِسْمِ");
    expect(span?.style.fontFamily).toBe("");
  });
});
