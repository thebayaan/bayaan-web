import { describe, expect, it } from "vitest";
import {
  getHizbForPage,
  getJuzForPage,
  getJuzIndexEntries,
  getJuzName,
  JUZ_START_PAGES,
} from "@/data/juz-data";
import { getMushafReaderPath, parseMushafSearchQuery } from "@/lib/mushaf-navigation";

describe("juz-data", () => {
  it("maps pages to juz and hizb", () => {
    expect(getJuzForPage(1)).toBe(1);
    expect(getJuzForPage(22)).toBe(2);
    expect(getJuzForPage(582)).toBe(30);
    expect(getHizbForPage(1)).toBe(1);
    expect(getHizbForPage(12)).toBe(2);
  });

  it("builds 30 juz index entries", () => {
    const entries = getJuzIndexEntries();
    expect(entries).toHaveLength(30);
    expect(entries[0]?.startPage).toBe(JUZ_START_PAGES[0]);
    expect(getJuzName(30)).toBe("Juz 'Amma");
    expect(getJuzName(29)).toBe("Juz Tabarak");
  });
});

describe("parseMushafSearchQuery", () => {
  it("parses page and juz queries", () => {
    expect(parseMushafSearchQuery("page 42")[0]?.href).toBe("/quran/2");
    expect(parseMushafSearchQuery("juz 5")[0]?.href).toBe("/quran/4");
  });

  it("builds reader paths for mushaf pages", () => {
    expect(getMushafReaderPath(1)).toBe("/quran/1");
    expect(getMushafReaderPath(42)).toBe("/quran/2");
    expect(getMushafReaderPath(582)).toBe("/quran/78");
  });

  it("parses verse references", () => {
    const result = parseMushafSearchQuery("2:255")[0];
    expect(result?.href).toBe("/quran/2/255");
  });
});
