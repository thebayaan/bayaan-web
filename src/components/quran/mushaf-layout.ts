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
