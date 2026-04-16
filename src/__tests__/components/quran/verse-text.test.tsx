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
  it("renders all words", () => {
    const { container } = render(
      <VerseText words={mockWords} isFontLoaded={false} fontFamily="UthmanicHafs" />,
    );
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });
  it("applies RTL direction", () => {
    const { container } = render(
      <VerseText words={mockWords} isFontLoaded={false} fontFamily="UthmanicHafs" />,
    );
    expect(container.firstElementChild?.getAttribute("dir")).toBe("rtl");
  });
  it("applies space-between for mushaf mode", () => {
    const { container } = render(
      <VerseText words={mockWords} isFontLoaded={false} fontFamily="UthmanicHafs" mushafMode />,
    );
    expect(container.firstElementChild?.className).toContain("justify-between");
  });
});
