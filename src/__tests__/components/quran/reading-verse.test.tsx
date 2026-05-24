import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ReadingVerse } from "@/components/quran/reading-verse";
import type { QcfVerse } from "@/types/quran-api";

vi.mock("@/hooks/use-play-from-ayah", () => ({
  usePlayFromAyah: () => ({
    playFromAyah: vi.fn(),
    canPlayFromAyah: false,
    resolvedReciter: null,
  }),
}));

const mockVerse: QcfVerse = {
  id: 1,
  verse_key: "2:255",
  verse_number: 255,
  chapter_id: 2,
  page_number: 42,
  hizb_number: 5,
  rub_el_hizb_number: 18,
  ruku_number: 35,
  manzil_number: 1,
  sajdah_number: null,
  juz_number: 3,
  text_uthmani: "",
  words: [],
  translations: [],
};

const fontResolver = {
  isPageFontLoaded: () => true,
  getFontFamily: () => "UthmanicHafs",
};

describe("ReadingVerse", () => {
  it("uses verse_key as DOM id for fragment anchoring", () => {
    const { container } = render(
      <ReadingVerse
        verse={mockVerse}
        fontResolver={fontResolver}
        fontSize="1.8rem"
        showTranslation={false}
        surahId={2}
        surahName="Al-Baqarah"
      />,
    );
    expect(container.firstElementChild?.id).toBe("2:255");
  });

  it("marks target verse with aria-current", () => {
    const { container } = render(
      <ReadingVerse
        verse={mockVerse}
        fontResolver={fontResolver}
        fontSize="1.8rem"
        showTranslation={false}
        surahId={2}
        surahName="Al-Baqarah"
        isTarget
      />,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-current", "true");
  });

  it("does not set aria-current when not targeted", () => {
    const { container } = render(
      <ReadingVerse
        verse={mockVerse}
        fontResolver={fontResolver}
        fontSize="1.8rem"
        showTranslation={false}
        surahId={2}
        surahName="Al-Baqarah"
      />,
    );
    expect(container.firstElementChild).not.toHaveAttribute("aria-current");
  });
});
