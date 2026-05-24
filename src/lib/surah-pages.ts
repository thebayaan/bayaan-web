import type { Surah } from "@/types/quran";

/**
 * Madani mushaf page range a surah occupies, derived from the
 * `pages: "start-end"` string in `src/data/surah-data.json`.
 *
 * Returns `null` for malformed data so callers can fall back gracefully
 * (e.g. degrade to whole-Quran progress) rather than crashing.
 */
export interface SurahPageRange {
  /** First mushaf page that contains any ayah of this surah. */
  start: number;
  /** Last mushaf page that contains any ayah of this surah. */
  end: number;
  /**
   * Total number of pages the surah spans (inclusive). For short surahs
   * that fit on a single page (e.g. Al-Fatiha "1-1") this is 1, not 0.
   */
  totalPages: number;
}

const RANGE_RE = /^(\d+)-(\d+)$/;

export function getSurahPageRange(surah: Pick<Surah, "pages">): SurahPageRange | null {
  const match = RANGE_RE.exec(surah.pages.trim());
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) {
    return null;
  }
  return { start, end, totalPages: end - start + 1 };
}

/**
 * Where the user currently sits inside a surah expressed in terms of
 * mushaf pages. Clamps `currentPage` into the surah's range so callers
 * never display nonsense like "page 50 of 49" when the user has scrolled
 * past the end of the surah they originally opened.
 */
export interface SurahReadingProgress {
  /** 1-indexed position within the surah, clamped to `[1, totalPages]`. */
  pageInSurah: number;
  /** Total pages the surah occupies. */
  totalPages: number;
  /** Integer percent `0..100`, computed from clamped pageInSurah. */
  percent: number;
}

export function getSurahReadingProgress(
  surah: Pick<Surah, "pages">,
  currentPage: number,
): SurahReadingProgress | null {
  const range = getSurahPageRange(surah);
  if (!range) return null;
  const clamped = Math.min(Math.max(currentPage, range.start), range.end);
  const pageInSurah = clamped - range.start + 1;
  const percent = Math.round((pageInSurah / range.totalPages) * 100);
  return {
    pageInSurah,
    totalPages: range.totalPages,
    percent: Math.max(0, Math.min(100, percent)),
  };
}
