import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MushafPage } from "@/components/quran/mushaf-page";
import type { QcfVerse, QcfWord } from "@/types/quran-api";
import { createTestFontResolver } from "@/__tests__/helpers/mushaf-font-resolver";

const fontResolver = createTestFontResolver({
  pageLoaded: true,
  fontFamily: (page) => `p${page}-v2`,
});

/**
 * Tiny helper for building plausible-looking QcfWord fixtures without
 * having to spell out every required field on every word — the renderer
 * only cares about a handful of them. Glyph codes are arbitrary PUA
 * codepoints since the test environment doesn't actually rasterise the
 * KFGQPC font.
 */
interface WordFixtureSpec {
  page: number;
  line: number;
  position: number;
  verseKey: string;
  verseId: number;
  charType?: QcfWord["char_type_name"];
}

function makeWord(spec: WordFixtureSpec): QcfWord {
  const { page, line, position, verseKey, verseId, charType = "word" } = spec;
  return {
    id: verseId * 1000 + position,
    position,
    audio_url: null,
    char_type_name: charType,
    code_v2: String.fromCharCode(0xfc00 + ((verseId * 50 + position) % 0x300)),
    page_number: page,
    line_number: line,
    text_uthmani: "x",
    text_imlaei_simple: "x",
    qpc_uthmani_hafs: "x",
    verse_key: verseKey,
    verse_id: verseId,
    location: `${verseKey}:${position}`,
  };
}

function makeVerse(
  verseKey: string,
  verseId: number,
  verseNumber: number,
  words: QcfWord[],
): QcfVerse {
  const [surahStr] = verseKey.split(":");
  return {
    id: verseId,
    verse_number: verseNumber,
    verse_key: verseKey,
    hizb_number: 1,
    rub_el_hizb_number: 1,
    ruku_number: 1,
    manzil_number: 1,
    sajdah_number: null,
    page_number: words[0]!.page_number,
    juz_number: 1,
    chapter_id: Number(surahStr),
    words,
    text_uthmani: "x",
  };
}

describe("MushafPage", () => {
  it("renders an inline surah-name header + basmallah on a top-of-page surah start", () => {
    // Matches the real shape returned by the QF API for page 151
    // (Al-A'raf start): line 3 is the first ayah, lines 1-2 are missing
    // because the printed mushaf reserves them for the surah-name banner
    // and basmallah.
    const verses: QcfVerse[] = [
      makeVerse("7:1", 954, 1, [
        makeWord({ page: 151, line: 3, position: 1, verseKey: "7:1", verseId: 954 }),
        makeWord({
          page: 151,
          line: 3,
          position: 2,
          verseKey: "7:1",
          verseId: 954,
          charType: "end",
        }),
      ]),
      makeVerse("7:2", 955, 2, [
        makeWord({ page: 151, line: 4, position: 1, verseKey: "7:2", verseId: 955 }),
      ]),
    ];
    render(
      <MushafPage verses={verses} pageNumber={151} fontResolver={fontResolver} fontSize="1.8rem" />,
    );
    expect(screen.getByLabelText("Surah 7")).toBeInTheDocument();
    expect(screen.getByLabelText("Bismillah ar-Rahman ar-Raheem")).toBeInTheDocument();
  });

  it("renders surah-name header + basmallah mid-page when a new surah begins on the same page another ended", () => {
    // Matches the real shape returned by the QF API for page 106
    // (An-Nisa ends, Al-Ma'idah begins): lines 1-5 carry the tail of
    // 4:176, lines 6-7 are missing (banner + basmallah), line 8 carries
    // the first word of 5:1. The header components must therefore appear
    // *between* the line-5 and line-8 verse divs in the rendered output.
    const verses: QcfVerse[] = [
      makeVerse("4:176", 593, 176, [
        makeWord({ page: 106, line: 1, position: 1, verseKey: "4:176", verseId: 593 }),
        makeWord({
          page: 106,
          line: 5,
          position: 2,
          verseKey: "4:176",
          verseId: 593,
          charType: "end",
        }),
      ]),
      makeVerse("5:1", 670, 1, [
        makeWord({ page: 106, line: 8, position: 1, verseKey: "5:1", verseId: 670 }),
      ]),
    ];
    const { container } = render(
      <MushafPage verses={verses} pageNumber={106} fontResolver={fontResolver} fontSize="1.8rem" />,
    );
    expect(screen.getByLabelText("Surah 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Bismillah ar-Rahman ar-Raheem")).toBeInTheDocument();

    // Verify DOM order: An-Nisa ayah → Al-Ma'idah header → basmallah →
    // Al-Ma'idah ayah. Walking the four "anchor" elements (the two
    // selectable ayah lines exposed as role=button, plus the two
    // aria-labelled banner elements) in document order is more robust
    // than asserting raw sibling positions, which break the moment we
    // wrap or unwrap a layout div.
    const anchors = Array.from(
      container.querySelectorAll(
        '[role="button"], [aria-label="Surah 5"], [aria-label="Bismillah ar-Rahman ar-Raheem"]',
      ),
    );
    const tags = anchors.map(
      (el) =>
        el.getAttribute("aria-label") ?? (el.getAttribute("role") === "button" ? "ayah" : "?"),
    );
    // Fixture produces 2 An-Nisa ayah lines (line 1 + line 5) followed
    // by 1 Al-Ma'idah ayah line (line 8). The Al-Ma'idah header must
    // land between them — not at the top of the page and not below the
    // first Al-Ma'idah ayah.
    expect(tags).toEqual(["ayah", "ayah", "Surah 5", "Bismillah ar-Rahman ar-Raheem", "ayah"]);
  });

  it("omits the inline basmallah for At-Tawbah (surah 9)", () => {
    // Surah 9 is the only non-Al-Fatiha surah without a basmallah —
    // drawing one for it would be a real religious correctness bug.
    const verses: QcfVerse[] = [
      makeVerse("9:1", 1236, 1, [
        makeWord({ page: 187, line: 3, position: 1, verseKey: "9:1", verseId: 1236 }),
      ]),
    ];
    render(
      <MushafPage verses={verses} pageNumber={187} fontResolver={fontResolver} fontSize="1.8rem" />,
    );
    expect(screen.getByLabelText("Surah 9")).toBeInTheDocument();
    expect(screen.queryByLabelText("Bismillah ar-Rahman ar-Raheem")).not.toBeInTheDocument();
  });

  it("does NOT inject an inline basmallah on the framed Al-Fatiha page", () => {
    // Page 1 already uses the decorative MushafFramedPage which has its
    // own surah banner — we must not double up by also injecting our
    // inline header in the line-by-line renderer (Al-Fatiha's verse 1:1
    // IS the basmallah; drawing a separate inline basmallah would
    // duplicate it).
    const verses: QcfVerse[] = [
      makeVerse("1:1", 1, 1, [
        makeWord({ page: 1, line: 9, position: 1, verseKey: "1:1", verseId: 1 }),
      ]),
    ];
    render(
      <MushafPage verses={verses} pageNumber={1} fontResolver={fontResolver} fontSize="1.8rem" />,
    );
    expect(screen.queryByLabelText("Bismillah ar-Rahman ar-Raheem")).not.toBeInTheDocument();
  });

  it("renders no header on a regular mid-surah page", () => {
    // A page with no verse_number=1 anywhere should render bare ayah
    // lines (no surah banner, no basmallah). This guards against an
    // overeager detector that would inject banners on every page.
    const verses: QcfVerse[] = [
      makeVerse("2:50", 57, 50, [
        makeWord({ page: 8, line: 1, position: 1, verseKey: "2:50", verseId: 57 }),
      ]),
    ];
    render(
      <MushafPage verses={verses} pageNumber={8} fontResolver={fontResolver} fontSize="1.8rem" />,
    );
    expect(screen.queryByLabelText(/^Surah \d+$/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Bismillah ar-Rahman ar-Raheem")).not.toBeInTheDocument();
  });

  it("keeps QCF lines at the design font size when zooming via fontSize", () => {
    const verses: QcfVerse[] = [
      makeVerse("2:1", 8, 1, [
        makeWord({ page: 2, line: 3, position: 1, verseKey: "2:1", verseId: 8 }),
      ]),
    ];
    const { container } = render(
      <MushafPage verses={verses} pageNumber={2} fontResolver={fontResolver} fontSize="2.4rem" />,
    );
    const line = container.querySelector("[dir='rtl']") as HTMLElement;
    expect(line.style.fontSize).toBe("1.8rem");
    const scaled = container.querySelector("[style*='transform: scale']") as HTMLElement | null;
    expect(scaled?.style.transform).toContain("scale(1.333");
  });
});
