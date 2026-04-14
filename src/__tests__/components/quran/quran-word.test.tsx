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
        isFontLoaded={false}
        fontFamily="UthmanicHafs"
      />,
    );
    expect(container.querySelector("span")?.textContent).toBe("بِسْمِ");
  });

  it("renders glyph code when font loaded", () => {
    const { container } = render(
      <QuranWord word={mockWord} isFontLoaded={true} fontFamily="p1-v2" />,
    );
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("\ufc41");
    expect(span?.style.fontFamily).toBe("p1-v2");
  });
});
