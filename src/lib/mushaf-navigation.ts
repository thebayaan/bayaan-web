import surahData from "@/data/surah-data.json";
import { JUZ_START_PAGES, getJuzName } from "@/data/juz-data";
import { getSurahPageRange } from "@/lib/surah-pages";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];

/** Map mushaf page → surah id that begins on or contains that page. */
export function buildPageToSurahMap(): Record<number, number> {
  const map: Record<number, number> = {};
  for (const surah of surahs) {
    const range = getSurahPageRange(surah);
    if (!range) continue;
    for (let page = range.start; page <= range.end; page += 1) {
      if (map[page] == null) {
        map[page] = surah.id;
      }
    }
  }
  return map;
}

const PAGE_TO_SURAH = buildPageToSurahMap();

export function getSurahIdForPage(page: number): number | null {
  const id = PAGE_TO_SURAH[page];
  return id ?? null;
}

/** Reader route for a mushaf page — prefers the surah reader when a chapter owns the page. */
export function getMushafReaderPath(page: number): string {
  const surahId = getSurahIdForPage(page);
  return surahId ? `/quran/${surahId}` : `/mushaf/${page}`;
}

type MushafRouter = { push: (path: string) => void };

/** Update reading settings and route to the mushaf page (juz tab, picker, palette, etc.). */
export function navigateToMushafPage(page: number, router: MushafRouter): void {
  useReadingSettingsStore.getState().jumpToMushafPage(page);
  router.push(getMushafReaderPath(page));
}

export type MushafSearchResult =
  | { type: "page"; page: number; title: string; subtitle: string; href: string }
  | { type: "juz"; juz: number; page: number; title: string; subtitle: string; href: string }
  | { type: "verse"; surahId: number; ayah: number; title: string; subtitle: string; href: string }
  | { type: "surah"; surah: Surah; title: string; subtitle: string; href: string };

function surahNameForPage(page: number): string {
  const surahId = getSurahIdForPage(page);
  if (!surahId) return "";
  return surahs.find((s) => s.id === surahId)?.name ?? "";
}

/**
 * Parse mushaf navigation queries (page, juz, verse ref, surah names).
 * Mirrors Bayaan mobile `MushafSearchView.parseSearchQuery`.
 */
export function parseMushafSearchQuery(query: string): MushafSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const lower = q.toLowerCase();
  const results: MushafSearchResult[] = [];

  const pageMatch = q.match(/^(?:page|pg)\s+(\d+)$/i);
  if (pageMatch) {
    const page = Number(pageMatch[1]);
    if (page >= 1 && page <= 604) {
      results.push({
        type: "page",
        page,
        title: `Page ${page}`,
        subtitle: surahNameForPage(page),
        href: getMushafReaderPath(page),
      });
    }
    return results;
  }

  if (lower === "juz" || lower === "jz") {
    for (let juz = 1; juz <= 30; juz += 1) {
      const page = JUZ_START_PAGES[juz - 1] ?? 1;
      results.push({
        type: "juz",
        juz,
        page,
        title: getJuzName(juz),
        subtitle: `Page ${page} · ${surahNameForPage(page)}`,
        href: getMushafReaderPath(page),
      });
    }
    return results;
  }

  const juzMatch = q.match(/^(?:juz|j|jz)\s*(\d+)$/i);
  const juzNames: Record<string, number> = {
    amma: 30,
    "juz amma": 30,
    tabarak: 29,
    "juz tabarak": 29,
  };

  if (juzMatch || juzNames[lower]) {
    const juz = juzMatch ? Number(juzMatch[1]) : juzNames[lower];
    if (juz != null && juz >= 1 && juz <= 30) {
      const page = JUZ_START_PAGES[juz - 1] ?? 1;
      results.push({
        type: "juz",
        juz,
        page,
        title: getJuzName(juz),
        subtitle: `Page ${page} · ${surahNameForPage(page)}`,
        href: getMushafReaderPath(page),
      });
    }
    if (juzMatch) return results;
  }

  const verseMatch = q.match(/^(\d{1,3})\s*:\s*(\d{1,3})$/);
  if (verseMatch) {
    const surahId = Number(verseMatch[1]);
    const ayah = Number(verseMatch[2]);
    const surah = surahs.find((s) => s.id === surahId);
    if (surah && ayah >= 1 && ayah <= surah.verses_count) {
      results.push({
        type: "verse",
        surahId,
        ayah,
        title: `${surah.name} ${surahId}:${ayah}`,
        subtitle: surah.translated_name_english,
        href: `/quran/${surahId}/${ayah}`,
      });
    }
    return results;
  }

  const plainNum = /^\d+$/.test(q) ? Number(q) : null;
  if (plainNum !== null) {
    if (plainNum >= 1 && plainNum <= 114) {
      const surah = surahs.find((s) => s.id === plainNum);
      if (surah) {
        results.push({
          type: "surah",
          surah,
          title: surah.name,
          subtitle: `Surah ${surah.id} · ${surah.translated_name_english}`,
          href: `/quran/${surah.id}`,
        });
      }
    }
    if (plainNum >= 1 && plainNum <= 30) {
      const page = JUZ_START_PAGES[plainNum - 1] ?? 1;
      results.push({
        type: "juz",
        juz: plainNum,
        page,
        title: getJuzName(plainNum),
        subtitle: `Page ${page} · ${surahNameForPage(page)}`,
        href: getMushafReaderPath(page),
      });
    }
    if (plainNum >= 1 && plainNum <= 604) {
      results.push({
        type: "page",
        page: plainNum,
        title: `Page ${plainNum}`,
        subtitle: surahNameForPage(plainNum),
        href: getMushafReaderPath(plainNum),
      });
    }
    return results;
  }

  for (const surah of surahs) {
    if (
      surah.name.toLowerCase().includes(lower) ||
      surah.translated_name_english.toLowerCase().includes(lower) ||
      surah.name_arabic.includes(q)
    ) {
      results.push({
        type: "surah",
        surah,
        title: surah.name,
        subtitle: surah.translated_name_english,
        href: `/quran/${surah.id}`,
      });
    }
  }

  return results;
}
