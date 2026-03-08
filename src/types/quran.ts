export interface Verse {
  id: number;
  surah_number: number;
  ayah_number: number;
  verse_key: string;
  text: string;
  translation?: string;
  transliteration?: string;
}

export interface Surah {
  id: number;
  name: string;
  name_arabic: string;
  revelation_place: 'Makkah' | 'Madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  verses_count: number;
  pages: string;
  translated_name_english: string;
}

export interface QuranData {
  [key: string]: Verse;
}

export interface Theme {
  theme: string;
  keywords: string;
  ayahFrom: number;
  ayahTo: number;
  totalAyahs: number;
}

export interface SimilarAyah {
  matchedVerseKey: string;
  matchedWordsCount: number;
  coverage: number;
  score: number;
  matchWordsRange: number[][];
}

export interface MutashabihatMatch {
  verseKey: string;
  wordRanges: [number, number][];
}

export interface MutashabihatPhrase {
  phraseId: number;
  sourceVerse: string;
  sourceWordRange: [number, number];
  totalOccurrences: number;
  matches: MutashabihatMatch[];
}
