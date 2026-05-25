import { surahGlyphMap } from "@/data/surah-glyph-map";
import { MUSHAF_BISMILLAH } from "./mushaf-layout";
import type { MushafFontResolver } from "@/lib/mushaf-fonts";
import { cn } from "@/lib/utils";

/**
 * The basmallah encoded as the 4 KFGQPC V2 word-glyphs that live in the
 * page-1 font (`p1-v2`) at U+FC41..U+FC44. These are the same PUA
 * codepoints the QF API returns as `code_v2` for verse 1:1 (see
 * `api.qurancdn.com/api/qdc/verses/by_page/1`) — joining them in
 * `p1-v2` renders the same decorative connected ligature the printed
 * Madani mushaf draws above every surah that has a basmallah, and the
 * same one Quran.com displays. This is the canonical approach the
 * native Bayaan client uses (see `BASMALA_TEXT` / `BASMALA_FONT_FAMILY`
 * in `services/mushaf/QCFDataService.ts` on the develop branch).
 *
 * No hair-space separators here: the basmallah glyphs are designed to
 * render as a single connected ligature, and dropping separators
 * between them would visually break the join.
 */
const BASMALLAH_CODE_V2 = "\uFC41\uFC42\uFC43\uFC44";

/**
 * Stable DOM id for the surah-name banner of a given surah. Used by
 * MushafView's anchor-scroll effect to land readers exactly on the
 * basmallah when they open a surah whose first page is shared with the
 * tail of the previous surah (e.g. opening /quran/16 An-Nahl, whose
 * basmallah sits halfway down page 267 below the tail of Al-Hijr).
 * Without this anchor the page-top scroll lands on Al-Hijr's last
 * verses, which the user reported as "I see the last part of the
 * previous surah".
 */
export function mushafSurahAnchorId(surahNumber: number): string {
  return `mushaf-surah-${surahNumber}-anchor`;
}

/**
 * Centered surah-name glyph drawn above the first ayah of a surah when
 * that surah starts on a non-framed mushaf page. Mirrors what the native
 * Bayaan client does via `SkiaSurahHeader` (see
 * `components/mushaf/skia/SkiaSurahHeader.tsx` on the develop branch),
 * but in plain CSS — the glyph itself comes from the SurahNames OpenType
 * font we already ship for the framed pages 1–2 banner.
 */
export function MushafSurahHeader({
  surahNumber,
  className,
}: {
  surahNumber: number;
  className?: string;
}) {
  const glyph = surahGlyphMap[surahNumber];
  if (!glyph) return null;
  return (
    <div
      id={mushafSurahAnchorId(surahNumber)}
      className={cn(
        // scroll-mt offsets the sticky mushaf header so anchor scrolls
        // don't tuck the banner underneath it.
        "flex w-full scroll-mt-16 items-center justify-center py-2 select-none",
        className,
      )}
      aria-label={`Surah ${surahNumber}`}
    >
      <span className="font-surah-names text-[2.2rem] leading-none">{glyph}</span>
    </div>
  );
}

/**
 * Centered basmallah line drawn between a surah-name header and the
 * surah's first ayah.
 *
 * When the page-1 KFGQPC font is loaded (which `MushafView` now
 * preloads unconditionally — see the `fontPages` memo there) this
 * renders the decorative connected ligature the printed Madani mushaf
 * uses. Otherwise we fall back to the literal Arabic text in
 * `UthmanicHafs` so the basmallah is always *something*, even during
 * the brief first-paint window before the woff2 finishes downloading.
 */
export function MushafBasmallah({
  fontSize,
  fontResolver,
  className,
}: {
  fontSize: string;
  fontResolver?: MushafFontResolver;
  className?: string;
}) {
  const useGlyphBasmallah =
    fontResolver?.config.basmallahMode === "glyph" && fontResolver.isPageFontLoaded(1);
  const ariaLabel = "Bismillah ar-Rahman ar-Raheem";

  if (useGlyphBasmallah && fontResolver) {
    return (
      <div
        dir="rtl"
        lang="ar"
        aria-label={ariaLabel}
        className={cn("w-full py-1 text-center leading-[1.4] select-none", className)}
        style={{
          fontFamily: fontResolver.getFontFamily(1),
          fontSize,
          ...(fontResolver.fontPalette ? { fontPalette: fontResolver.fontPalette } : undefined),
        }}
      >
        {BASMALLAH_CODE_V2}
      </div>
    );
  }

  return (
    <p
      dir="rtl"
      lang="ar"
      aria-label={ariaLabel}
      className={cn("w-full text-center font-[UthmanicHafs] leading-[1.9]", className)}
      style={{ fontSize }}
    >
      {MUSHAF_BISMILLAH}
    </p>
  );
}
