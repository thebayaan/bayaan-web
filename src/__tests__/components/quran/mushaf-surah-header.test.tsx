import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MushafBasmallah,
  MushafSurahHeader,
  mushafSurahAnchorId,
} from "@/components/quran/mushaf-surah-header";
import { createTestFontResolver } from "@/__tests__/helpers/mushaf-font-resolver";

const loadedResolver = createTestFontResolver({
  pageLoaded: true,
  fontFamily: (page) => `p${page}-v2`,
});

const unloadedResolver = createTestFontResolver({ pageLoaded: false });

describe("MushafSurahHeader", () => {
  it("renders the surah-name glyph with an aria-label", () => {
    render(<MushafSurahHeader surahNumber={2} />);
    const banner = screen.getByLabelText("Surah 2");
    expect(banner).toBeInTheDocument();
    // The glyph itself is a single PUA codepoint from the SurahNames
    // font (we don't assert the exact codepoint to avoid coupling the
    // test to the surah-glyph-map data file).
    expect(banner.textContent?.length).toBeGreaterThan(0);
  });

  it("renders nothing for an unknown surah number", () => {
    const { container } = render(<MushafSurahHeader surahNumber={999} />);
    expect(container.firstChild).toBeNull();
  });

  it("tags the banner with a stable anchor id so MushafView can scroll to it", () => {
    // The id is how MushafView lands users on the basmallah of a
    // shared-page surah (e.g. An-Nahl whose banner sits mid-page on
    // page 267) instead of the page's top. If the id changes shape,
    // MushafView's getElementById lookup silently misses and we
    // regress to "I see the last part of the previous surah".
    render(<MushafSurahHeader surahNumber={16} />);
    const banner = screen.getByLabelText("Surah 16");
    expect(banner.id).toBe("mushaf-surah-16-anchor");
    expect(mushafSurahAnchorId(16)).toBe("mushaf-surah-16-anchor");
  });
});

describe("MushafBasmallah", () => {
  it("renders the KFGQPC PUA glyphs in the p1-v2 font when page-1 font is loaded", () => {
    // This is the "good" path the user asked for: with the page-1 font
    // available the basmallah renders as the decorative connected
    // ligature (the same one Quran.com uses), driven by the 4 PUA
    // codepoints U+FC41..U+FC44 from KFGQPC V2.
    render(<MushafBasmallah fontSize="1.8rem" fontResolver={loadedResolver} />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(el.textContent).toBe("\uFC41\uFC42\uFC43\uFC44");
    expect((el as HTMLElement).style.fontFamily).toBe("p1-v2");
    expect((el as HTMLElement).style.fontSize).toBe("1.8rem");
  });

  it("falls back to the literal Arabic text + UthmanicHafs when page-1 font isn't loaded yet", () => {
    // Brief first-paint window before the woff2 finishes downloading.
    // The basmallah must always be readable, even if it's the plain
    // (less pretty) fallback for a moment.
    render(<MushafBasmallah fontSize="1.8rem" fontResolver={unloadedResolver} />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    // Asserts it's NOT the PUA-codepoint form.
    expect(el.textContent).not.toBe("\uFC41\uFC42\uFC43\uFC44");
    expect(el.textContent).toMatch(/بِسْمِ ٱللَّهِ/);
  });

  it("falls back when no fontResolver is provided", () => {
    // Some callers (e.g. unit tests that just check structural output)
    // don't pass a resolver. We treat that as "font not loaded" so we
    // never crash on the optional access.
    render(<MushafBasmallah fontSize="1.5rem" />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(el.textContent).toMatch(/بِسْمِ ٱللَّهِ/);
  });
});
