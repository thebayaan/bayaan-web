import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SurahHeader } from "@/components/quran/surah-header";
import { createTestFontResolver } from "@/__tests__/helpers/mushaf-font-resolver";

describe("SurahHeader", () => {
  it("renders the connected basmallah glyph for list-mode surah headers", () => {
    const fontResolver = createTestFontResolver({
      pageLoaded: true,
      fontFamily: "p1-v2",
    });

    render(
      <SurahHeader
        surahNumber={2}
        surahName="Al-Baqarah"
        showBismillah
        fontResolver={fontResolver}
        fontSize="1.8rem"
      />,
    );

    const basmallah = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(basmallah.textContent).toBe("\uFC41\uFC42\uFC43\uFC44");
    expect((basmallah as HTMLElement).style.fontFamily).toBe("p1-v2");
  });

  it("does not render basmallah for At-Tawbah", () => {
    render(<SurahHeader surahNumber={9} surahName="At-Tawbah" showBismillah />);

    expect(screen.queryByLabelText("Bismillah ar-Rahman ar-Raheem")).not.toBeInTheDocument();
  });
});
