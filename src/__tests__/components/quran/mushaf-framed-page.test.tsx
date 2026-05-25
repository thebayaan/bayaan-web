import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MushafFramedPage } from "@/components/quran/mushaf-framed-page";
import { createTestFontResolver } from "@/__tests__/helpers/mushaf-font-resolver";

describe("MushafFramedPage", () => {
  it("renders the surah banner for page 1", () => {
    render(
      <MushafFramedPage pageNumber={1} surahNumber={1}>
        <p>lines</p>
      </MushafFramedPage>,
    );
    expect(screen.getByLabelText("Surah 1")).toBeInTheDocument();
    expect(screen.getByText("lines")).toBeInTheDocument();
  });

  it("renders bismillah on page 2 (falls back to UthmanicHafs when no resolver)", () => {
    render(
      <MushafFramedPage pageNumber={2} surahNumber={2}>
        <p>lines</p>
      </MushafFramedPage>,
    );
    expect(screen.getByLabelText("Surah 2")).toBeInTheDocument();
    expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument();
  });

  it("renders the decorative KFGQPC basmallah on page 2 when the p1-v2 font is loaded", () => {
    // In the real app MushafView always preloads page-1's font (see the
    // `fontPages` memo there), so the framed page 2 basmallah will
    // virtually always take this branch — verify the wiring renders the
    // PUA-codepoint form, not the plain Arabic fallback.
    render(
      <MushafFramedPage
        pageNumber={2}
        surahNumber={2}
        fontResolver={createTestFontResolver({
          pageLoaded: true,
          fontFamily: (page) => `p${page}-v2`,
        })}
        fontSize="2rem"
      >
        <p>lines</p>
      </MushafFramedPage>,
    );
    const basmallah = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(basmallah.textContent).toBe("\uFC41\uFC42\uFC43\uFC44");
    expect((basmallah as HTMLElement).style.fontFamily).toBe("p1-v2");
  });
});
