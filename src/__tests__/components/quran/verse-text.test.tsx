import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VerseText } from "@/components/quran/verse-text";
import type { QcfWord } from "@/types/quran-api";
import { createTestFontResolver } from "@/__tests__/helpers/mushaf-font-resolver";

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
    const fontResolver = createTestFontResolver();
    const { container } = render(<VerseText words={mockWords} fontResolver={fontResolver} />);
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });

  it("applies RTL direction in reading mode", () => {
    const fontResolver = createTestFontResolver();
    const { container } = render(<VerseText words={mockWords} fontResolver={fontResolver} />);
    expect(container.firstElementChild?.getAttribute("dir")).toBe("rtl");
  });

  it("renders Al-Fatiha basmallah as a connected glyph in reading mode", () => {
    const basmallahWords: QcfWord[] = [
      mockWords[0]!,
      mockWords[1]!,
      {
        ...mockWords[1]!,
        id: 3,
        position: 3,
        code_v2: "\ufc43",
        location: "1:1:3",
      },
      {
        ...mockWords[1]!,
        id: 4,
        position: 4,
        code_v2: "\ufc44",
        location: "1:1:4",
      },
    ];
    const fontResolver = createTestFontResolver({ pageLoaded: true, fontFamily: "p1-v2" });
    const { container, getByLabelText } = render(
      <VerseText words={basmallahWords} fontResolver={fontResolver} />,
    );
    const basmallah = getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(basmallah.textContent).toBe("\uFC41\uFC42\uFC43\uFC44");
    expect((basmallah as HTMLElement).style.fontFamily).toBe("p1-v2");
    expect(container.querySelectorAll("[data-word-location]")).toHaveLength(0);
  });

  it("joins QCF glyph codes with hair-space separators when the page font is loaded", () => {
    const fontResolver = createTestFontResolver({ pageLoaded: true, fontFamily: "p1-v2" });
    const { container } = render(
      <VerseText words={mockWords} fontResolver={fontResolver} mushafMode />,
    );
    // Hair-space (U+200A) is inserted between glyphs so the browser has
    // justification opportunities for `text-align-last: justify` to fill
    // the page width.
    const el = container.firstElementChild as HTMLElement;
    expect(el.textContent).toBe("\ufc41\u200a\ufc42");
    expect(el.style.fontFamily).toBe("p1-v2");
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("justifies non-centered mushaf lines edge-to-edge when the font is loaded", () => {
    const fontResolver = createTestFontResolver({ pageLoaded: true, fontFamily: "p1-v2" });
    const { container } = render(
      <VerseText words={mockWords} fontResolver={fontResolver} mushafMode />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.textAlign).toBe("justify");
    expect(el.style.textAlignLast).toBe("justify");
  });

  it("keeps words in canonical reading order on mushaf lines spanning multiple verses", () => {
    // Real-world example: line 3 of page 50 holds the tail of 3:1 followed
    // by all of 3:2 and the start of 3:3. The QF API resets `position` to 1
    // at the start of every verse, so a naive `sort by position` would
    // interleave the verses (3:1:1 / 3:2:1 / 3:3:1 / 3:1:2 / ...). This
    // test guards against that regression.
    const multiVerseWords: QcfWord[] = [
      // Tail of 3:1 — passed in OUT OF ORDER on purpose to also exercise the sort.
      {
        id: 102,
        position: 2,
        audio_url: null,
        char_type_name: "end",
        code_v2: "\ufc02",
        page_number: 50,
        line_number: 3,
        text_uthmani: "x",
        text_imlaei_simple: "x",
        qpc_uthmani_hafs: "x",
        verse_key: "3:1",
        verse_id: 295,
        location: "3:1:2",
      },
      {
        id: 101,
        position: 1,
        audio_url: null,
        char_type_name: "word",
        code_v2: "\ufc01",
        page_number: 50,
        line_number: 3,
        text_uthmani: "x",
        text_imlaei_simple: "x",
        qpc_uthmani_hafs: "x",
        verse_key: "3:1",
        verse_id: 295,
        location: "3:1:1",
      },
      // Start of 3:2 — same low positions as 3:1, exercises the bug.
      {
        id: 201,
        position: 1,
        audio_url: null,
        char_type_name: "word",
        code_v2: "\ufc11",
        page_number: 50,
        line_number: 3,
        text_uthmani: "x",
        text_imlaei_simple: "x",
        qpc_uthmani_hafs: "x",
        verse_key: "3:2",
        verse_id: 296,
        location: "3:2:1",
      },
      {
        id: 202,
        position: 2,
        audio_url: null,
        char_type_name: "word",
        code_v2: "\ufc12",
        page_number: 50,
        line_number: 3,
        text_uthmani: "x",
        text_imlaei_simple: "x",
        qpc_uthmani_hafs: "x",
        verse_key: "3:2",
        verse_id: 296,
        location: "3:2:2",
      },
    ];
    const fontResolver = createTestFontResolver({ pageLoaded: true, fontFamily: "p50-v2" });
    const { container } = render(
      <VerseText words={multiVerseWords} fontResolver={fontResolver} mushafMode />,
    );
    // Expect 3:1:1, 3:1:2, 3:2:1, 3:2:2 — i.e. verse-by-verse — separated by
    // hair-spaces. A buggy position-only sort would produce 3:1:1, 3:2:1,
    // 3:1:2, 3:2:2 which would render in the wrong reading order.
    expect(container.firstElementChild?.textContent).toBe(
      "\ufc01\u200a\ufc02\u200a\ufc11\u200a\ufc12",
    );
  });

  it("centers mushaf lines on framed pages when requested", () => {
    const fontResolver = createTestFontResolver({ pageLoaded: true, fontFamily: "p1-v2" });
    const { container } = render(
      <VerseText words={mockWords} fontResolver={fontResolver} mushafMode lineAlignment="center" />,
    );
    expect(container.firstElementChild?.className).toContain("text-center");
  });

  it("justifies fallback mushaf lines when the page font is not loaded", () => {
    const fontResolver = createTestFontResolver();
    const { container } = render(
      <VerseText words={mockWords} fontResolver={fontResolver} mushafMode />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.textAlign).toBe("justify");
    expect(el.style.textAlignLast).toBe("justify");
  });

  it("justifies IndoPak lines with flexbox space-between", () => {
    const indopakWords: QcfWord[] = [
      {
        ...mockWords[0]!,
        text_indopak: "الٓمّٓ",
      },
      {
        ...mockWords[1]!,
        id: 3,
        position: 2,
        text_indopak: "ۚ",
      },
    ];
    const fontResolver = createTestFontResolver({
      fontId: "indopak",
      pageLoaded: true,
      fontFamily: "IndoPak",
    });
    const { container } = render(
      <VerseText words={indopakWords} fontResolver={fontResolver} mushafMode />,
    );
    const el = container.querySelector("[dir='rtl']") as HTMLElement;
    expect(el.className).toContain("flex");
    expect(el.className).toContain("justify-between");
    expect(el.className).toContain("w-full");
    expect(el.querySelectorAll("span.inline-block").length).toBe(2);
    expect(el.style.textAlign).toBe("");
  });
});
