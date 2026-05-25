/** Standard Madani mushaf content width used by Quran.com (px). */
export const MUSHAF_PAGE_WIDTH_PX = 512;

export const MUSHAF_PAGE_CLASS = "mx-auto w-full max-w-[512px]";

/** Pages 1–2 use centered lines and ornamental surah frames in the Madani mushaf. */
export const MUSHAF_FRAMED_PAGES = new Set([1, 2]);

export function isMushafFramedPage(pageNumber: number): boolean {
  return MUSHAF_FRAMED_PAGES.has(pageNumber);
}

export function getMushafPageSurah(pageNumber: number): number | null {
  if (pageNumber === 1) return 1;
  if (pageNumber === 2) return 2;
  return null;
}

export type MushafLineAlignment = "center" | "right";

export function getMushafLineAlignment(pageNumber: number): MushafLineAlignment {
  return isMushafFramedPage(pageNumber) ? "center" : "right";
}

export const MUSHAF_BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

/** KFGQPC V1 page-1 basmallah glyphs (verse 1:1 words 1–4). */
export const BASMALLAH_GLYPH_V1 = "\uFB51\uFB52\uFB53\uFB54";

/** KFGQPC V2/V4 page-1 basmallah glyphs (verse 1:1 words 1–4). */
export const BASMALLAH_GLYPH_V2 = "\uFC41\uFC42\uFC43\uFC44";

/**
 * Whether the inline mushaf renderer should draw a basmallah line above
 * a surah's first ayah.
 *
 *   - Surah 1 (Al-Fatiha): basmallah IS verse 1:1 — drawing it inline
 *     would duplicate the text the API already returns as words.
 *   - Surah 9 (At-Tawbah): traditionally has no basmallah.
 *   - Every other surah (2..114 except 9): gets an inline basmallah
 *     between its surah-name header and the first ayah word.
 */
export function surahHasInlineBasmallah(surahNumber: number): boolean {
  return surahNumber !== 1 && surahNumber !== 9;
}
