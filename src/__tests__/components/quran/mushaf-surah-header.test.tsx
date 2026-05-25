import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MushafBasmallah,
  MushafSurahHeader,
  mushafSurahAnchorId,
} from "@/components/quran/mushaf-surah-header";
import { MUSHAF_BISMILLAH } from "@/components/quran/mushaf-layout";
import { createTestFontResolver } from "@/__tests__/helpers/mushaf-font-resolver";

const loadedV2Resolver = createTestFontResolver({
  pageLoaded: true,
  fontFamily: (page) => `p${page}-v2`,
});

const loadedV1Resolver = createTestFontResolver({
  fontId: "qcf_v1",
  pageLoaded: true,
  fontFamily: (page) => `p${page}-v1`,
});

const loadedIndoPakResolver = createTestFontResolver({
  fontId: "indopak",
  pageLoaded: true,
});

const unloadedResolver = createTestFontResolver({ pageLoaded: false });

describe("MushafSurahHeader", () => {
  it("renders the surah-name glyph with an aria-label", () => {
    render(<MushafSurahHeader surahNumber={2} />);
    const banner = screen.getByLabelText("Surah 2");
    expect(banner).toBeInTheDocument();
    expect(banner.textContent?.length).toBeGreaterThan(0);
  });

  it("renders nothing for an unknown surah number", () => {
    const { container } = render(<MushafSurahHeader surahNumber={999} />);
    expect(container.firstChild).toBeNull();
  });

  it("tags the banner with a stable anchor id so MushafView can scroll to it", () => {
    render(<MushafSurahHeader surahNumber={16} />);
    const banner = screen.getByLabelText("Surah 16");
    expect(banner.id).toBe("mushaf-surah-16-anchor");
    expect(mushafSurahAnchorId(16)).toBe("mushaf-surah-16-anchor");
  });
});

describe("MushafBasmallah", () => {
  it("renders the KFGQPC V2 basmallah glyphs when page-1 font is loaded", () => {
    render(<MushafBasmallah fontSize="1.8rem" fontResolver={loadedV2Resolver} />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(el.textContent).toBe("\uFC41\uFC42\uFC43\uFC44");
    expect((el as HTMLElement).style.fontFamily).toBe("p1-v2");
  });

  it("renders the KFGQPC V1 basmallah glyphs when page-1 font is loaded", () => {
    render(<MushafBasmallah fontSize="1.8rem" fontResolver={loadedV1Resolver} />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(el.textContent).toBe("\uFB51\uFB52\uFB53\uFB54");
    expect((el as HTMLElement).style.fontFamily).toBe("p1-v1");
  });

  it("uses Uthmani basmallah for IndoPak", () => {
    render(<MushafBasmallah fontSize="1.8rem" fontResolver={loadedIndoPakResolver} />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(el.textContent).toBe(MUSHAF_BISMILLAH);
    expect((el as HTMLElement).style.fontFamily).toBe("UthmanicHafs");
  });

  it("falls back to Uthmani text while glyph fonts load", () => {
    render(<MushafBasmallah fontSize="1.8rem" fontResolver={unloadedResolver} />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(el.textContent).not.toBe("\uFC41\uFC42\uFC43\uFC44");
    expect(el.textContent).toMatch(/بِسْمِ ٱللَّهِ/);
  });

  it("falls back when no fontResolver is provided", () => {
    render(<MushafBasmallah fontSize="1.5rem" />);
    const el = screen.getByLabelText("Bismillah ar-Rahman ar-Raheem");
    expect(el.textContent).toMatch(/بِسْمِ ٱللَّهِ/);
  });
});
