import { describe, it, expect } from "vitest";
import { getSurahPageRange, getSurahReadingProgress } from "@/lib/surah-pages";

describe("getSurahPageRange", () => {
  it("parses multi-page surahs", () => {
    expect(getSurahPageRange({ pages: "2-49" })).toEqual({ start: 2, end: 49, totalPages: 48 });
  });

  it("treats single-page surahs as 1 page, not 0", () => {
    expect(getSurahPageRange({ pages: "1-1" })).toEqual({ start: 1, end: 1, totalPages: 1 });
  });

  it("returns null for malformed input rather than throwing", () => {
    expect(getSurahPageRange({ pages: "" })).toBeNull();
    expect(getSurahPageRange({ pages: "abc" })).toBeNull();
    expect(getSurahPageRange({ pages: "50-49" })).toBeNull(); // end < start
    expect(getSurahPageRange({ pages: "0-10" })).toBeNull(); // start < 1
  });

  it("trims whitespace before parsing", () => {
    expect(getSurahPageRange({ pages: " 50-76 " })).toEqual({ start: 50, end: 76, totalPages: 27 });
  });
});

describe("getSurahReadingProgress", () => {
  it("reports the page-within-surah and total pages for Al-Baqarah", () => {
    // User is on global mushaf page 17 while reading Al-Baqarah (pages 2-49).
    // Local position is 17 - 2 + 1 = 16 of 48 pages = 33%.
    expect(getSurahReadingProgress({ pages: "2-49" }, 17)).toEqual({
      pageInSurah: 16,
      totalPages: 48,
      percent: 33,
    });
  });

  it("clamps pages past the end of the surah to the last page", () => {
    // Scrolled into the next surah while lastReadSurahId still points at
    // Al-Baqarah — we should show "complete", not "page 50 of 48".
    expect(getSurahReadingProgress({ pages: "2-49" }, 99)).toEqual({
      pageInSurah: 48,
      totalPages: 48,
      percent: 100,
    });
  });

  it("clamps pages before the start of the surah to the first page", () => {
    expect(getSurahReadingProgress({ pages: "50-76" }, 1)).toEqual({
      pageInSurah: 1,
      totalPages: 27,
      percent: 4,
    });
  });

  it("returns null when the surah's pages field is malformed", () => {
    expect(getSurahReadingProgress({ pages: "garbage" }, 5)).toBeNull();
  });
});
