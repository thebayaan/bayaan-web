/** Standard Madani mushaf juz start pages (30 juz). Mirrors Bayaan mobile `constants.ts`. */
export const JUZ_START_PAGES: readonly number[] = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402,
  422, 442, 462, 482, 502, 522, 542, 562, 582,
];

/** Standard Madani mushaf hizb start pages (60 hizb). */
export const HIZB_START_PAGES: readonly number[] = [
  1, 12, 22, 32, 42, 52, 62, 72, 82, 92, 102, 112, 121, 132, 142, 152, 162, 173, 182, 192, 201, 212,
  222, 232, 242, 252, 262, 272, 282, 292, 302, 312, 322, 332, 342, 352, 362, 372, 382, 392, 402,
  412, 422, 432, 442, 452, 462, 472, 482, 492, 502, 512, 522, 532, 542, 553, 562, 572, 582, 591,
];

/** First verse of each juz in `surah:ayah` form (Madani mushaf). */
export const JUZ_START_VERSE_KEYS: readonly string[] = [
  "1:1",
  "2:142",
  "2:253",
  "3:92",
  "4:24",
  "4:148",
  "5:77",
  "6:111",
  "7:88",
  "8:41",
  "9:87",
  "11:6",
  "12:53",
  "15:1",
  "17:1",
  "18:75",
  "21:1",
  "23:1",
  "25:21",
  "27:56",
  "29:46",
  "33:31",
  "36:28",
  "39:32",
  "41:47",
  "45:33",
  "51:31",
  "58:1",
  "67:1",
  "78:1",
];

export interface JuzIndexEntry {
  juz: number;
  startPage: number;
  startVerseKey: string;
  label: string;
}

export function getJuzForPage(page: number): number {
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i -= 1) {
    const startPage = JUZ_START_PAGES[i];
    if (startPage != null && page >= startPage) return i + 1;
  }
  return 1;
}

export function getHizbForPage(page: number): number {
  for (let i = HIZB_START_PAGES.length - 1; i >= 0; i -= 1) {
    const startPage = HIZB_START_PAGES[i];
    if (startPage != null && page >= startPage) return i + 1;
  }
  return 1;
}

export function getJuzName(juzNumber: number): string {
  if (juzNumber === 30) return "Juz 'Amma";
  if (juzNumber === 29) return "Juz Tabarak";
  return `Juz ${juzNumber}`;
}

export function getJuzIndexEntries(): JuzIndexEntry[] {
  return JUZ_START_PAGES.map((startPage, index) => {
    const juz = index + 1;
    return {
      juz,
      startPage,
      startVerseKey: JUZ_START_VERSE_KEYS[index] ?? `${juz}:1`,
      label: getJuzName(juz),
    };
  });
}
