import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuranWord } from "@/components/quran/quran-word";
import type { QcfWord } from "@/types/quran-api";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useTajweedStore } from "@/stores/tajweed-store";

const playMock = vi.fn();

vi.mock("@/stores/word-audio-store", () => ({
  useWordAudioStore: (
    selector: (state: { activeLocation: string | null; play: typeof playMock }) => unknown,
  ) => selector({ activeLocation: null, play: playMock }),
}));

const mockWord: QcfWord = {
  id: 1,
  position: 1,
  audio_url: "wbw/001_001_001.mp3",
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
  translation: { text: "In (the) name", language_name: "english" },
  transliteration: { text: "bis'mi", language_name: "english" },
};

describe("QuranWord", () => {
  beforeEach(() => {
    playMock.mockClear();
    useReadingSettingsStore.setState({ showTajweed: false, showWordByWord: false });
    useTajweedStore.setState({
      byLocation: null,
      indexedTajweedData: null,
      isLoading: false,
      error: null,
    });
  });

  it("renders fallback text when font not loaded", () => {
    const { container } = render(
      <QuranWord
        word={mockWord}
        fontResolver={{ isPageFontLoaded: () => false, getFontFamily: () => "UthmanicHafs" }}
      />,
    );
    expect(container.querySelector("span")?.textContent).toContain("بِسْمِ");
  });

  it("renders glyph code when font loaded", () => {
    const { container } = render(
      <QuranWord
        word={mockWord}
        fontResolver={{ isPageFontLoaded: () => true, getFontFamily: () => "p1-v2" }}
      />,
    );
    const span = container.querySelector("[data-word-location='1:1:1']");
    expect(span?.textContent).toContain("\ufc41");
    expect(span).toHaveStyle({ fontFamily: "p1-v2" });
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
    const span = container.querySelector("[data-word-location='1:1:1']");
    expect(span?.textContent).toContain("بِسْمِ");
    expect(span).not.toHaveStyle({ fontFamily: "p2-v2" });
  });

  it("plays word audio when tapped in reading mode", () => {
    render(
      <QuranWord
        word={mockWord}
        wordAudioEnabled
        fontResolver={{ isPageFontLoaded: () => false, getFontFamily: () => "UthmanicHafs" }}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(playMock).toHaveBeenCalledWith(mockWord);
  });

  it("does not play audio when wordAudioEnabled is false", () => {
    render(
      <QuranWord
        word={mockWord}
        fontResolver={{ isPageFontLoaded: () => false, getFontFamily: () => "UthmanicHafs" }}
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(playMock).not.toHaveBeenCalled();
  });

  it("renders coloured tajweed segments when enabled", () => {
    useReadingSettingsStore.setState({ showTajweed: true });
    useTajweedStore.setState({
      byLocation: {
        "1:1:1": {
          word_index: 1,
          location: "1:1:1",
          segments: [
            { text: "ٱ", rule: "ham_wasl" },
            { text: "للَّهِ", rule: null },
          ],
        },
      },
      indexedTajweedData: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <QuranWord
        word={mockWord}
        fontResolver={{ isPageFontLoaded: () => true, getFontFamily: () => "p1-v2" }}
      />,
    );

    const colored = container.querySelector("span[style]");
    expect(colored?.textContent).toBe("ٱ");
    expect(colored?.getAttribute("style")).toContain("color");
  });
});
