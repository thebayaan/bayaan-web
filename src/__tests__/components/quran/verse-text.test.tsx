import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VerseText } from "@/components/quran/verse-text";
import type { QcfWord } from "@/types/quran-api";

const mockWords: QcfWord[] = [
  {
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
  },
  {
    id: 2,
    position: 2,
    audio_url: null,
    char_type_name: "word",
    code_v2: "\ufc42",
    page_number: 1,
    line_number: 1,
    text_uthmani: "ٱللَّهِ",
    text_imlaei_simple: "allah",
    qpc_uthmani_hafs: "ٱللَّهِ",
    verse_key: "1:1",
    verse_id: 1,
    location: "1:1:2",
  },
];

describe("VerseText", () => {
  it("renders all words in reading mode", () => {
    const fontResolver = { isPageFontLoaded: () => false, getFontFamily: () => "UthmanicHafs" };
    const { container } = render(<VerseText words={mockWords} fontResolver={fontResolver} />);
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });

  it("applies RTL direction in reading mode", () => {
    const fontResolver = { isPageFontLoaded: () => false, getFontFamily: () => "UthmanicHafs" };
    const { container } = render(<VerseText words={mockWords} fontResolver={fontResolver} />);
    expect(container.firstElementChild?.getAttribute("dir")).toBe("rtl");
  });

  it("joins QCF glyph codes into one line when the page font is loaded", () => {
    const fontResolver = { isPageFontLoaded: () => true, getFontFamily: () => "p1-v2" };
    const { container } = render(
      <VerseText words={mockWords} fontResolver={fontResolver} mushafMode />,
    );
    expect(container.firstElementChild?.textContent).toBe("\ufc41\ufc42");
    expect(container.firstElementChild?.style.fontFamily).toBe("p1-v2");
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("centers mushaf lines on framed pages when requested", () => {
    const fontResolver = { isPageFontLoaded: () => true, getFontFamily: () => "p1-v2" };
    const { container } = render(
      <VerseText
        words={mockWords}
        fontResolver={fontResolver}
        mushafMode
        lineAlignment="center"
      />,
    );
    expect(container.firstElementChild?.className).toContain("text-center");
  });

  it("justifies fallback mushaf lines when the page font is not loaded", () => {
    const fontResolver = { isPageFontLoaded: () => false, getFontFamily: () => "UthmanicHafs" };
    const { container } = render(
      <VerseText words={mockWords} fontResolver={fontResolver} mushafMode />,
    );
    expect(container.firstElementChild?.className).toContain("justify-between");
  });
});
