import { surahGlyphMap } from "@/data/surah-glyph-map";
import {
  getBasmallahGlyphText,
  getBasmallahUnicodeFontFamily,
  getBasmallahUnicodeText,
  type MushafFontResolver,
} from "@/lib/mushaf-fonts";
import { MUSHAF_BISMILLAH } from "@/components/quran/mushaf-layout";
import { cn } from "@/lib/utils";

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
 * QCF fonts render the decorative page-1 ligature when loaded; unicode
 * fonts use script-appropriate text in their own typeface.
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
  const ariaLabel = "Bismillah ar-Rahman ar-Raheem";
  const config = fontResolver?.config;
  const glyphText = config ? getBasmallahGlyphText(config) : null;
  const useGlyphBasmallah = Boolean(glyphText) && Boolean(fontResolver?.isPageFontLoaded(1));

  if (useGlyphBasmallah && fontResolver && glyphText) {
    return (
      <div
        dir="rtl"
        lang="ar"
        aria-label={ariaLabel}
        className={cn("w-full py-1 text-center leading-[1.4] select-none", className)}
        style={{
          fontFamily: fontResolver.getFontFamily(1),
          fontSize,
          ...(fontResolver.getPageFontPalette?.(1)
            ? { fontPalette: fontResolver.getPageFontPalette(1) }
            : undefined),
        }}
      >
        {glyphText}
      </div>
    );
  }

  const unicodeText = config ? getBasmallahUnicodeText(config) : MUSHAF_BISMILLAH;
  const unicodeFontFamily = config ? getBasmallahUnicodeFontFamily(config) : "UthmanicHafs";

  return (
    <p
      dir="rtl"
      lang="ar"
      aria-label={ariaLabel}
      className={cn("w-full text-center leading-[1.9]", className)}
      style={{ fontFamily: unicodeFontFamily, fontSize }}
    >
      {unicodeText}
    </p>
  );
}
