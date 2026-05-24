export interface Surah {
  id: number;
  name: string;
  name_arabic: string;
  name_simple: string;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  verses_count: number;
  translated_name_english: string;
  /**
   * The Madani mushaf page range this surah occupies, formatted as
   * "start-end" (e.g. "2-49" for Al-Baqarah). Surahs may share an endpoint
   * with their neighbours when a surah starts partway down the same page
   * the previous one ended on (e.g. An-Nisa "77-106" and Al-Ma'idah
   * "106-127" both list page 106).
   */
  pages: string;
}

export interface Verse {
  id: number;
  surah_number: number;
  ayah_number: number;
  verse_key: string;
  text: string;
  translation?: string;
  transliteration?: string;
}

export interface VerseBookmark {
  id: string;
  user_id: string;
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  note?: string;
  created_at: string;
}

export interface VerseHighlight {
  id: string;
  user_id: string;
  verse_key: string;
  color: "yellow" | "green" | "blue" | "pink" | "purple";
  created_at: string;
}

export interface VerseNote {
  id: string;
  user_id: string;
  verse_key: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AyahTimestamp {
  surah_number: number;
  ayah_number: number;
  timestamp_from: number;
  timestamp_to: number;
  duration_ms: number;
}

export interface ReadingThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  card: string;
}

export interface ReadingTheme {
  id: string;
  name: string;
  mode: "light" | "dark";
  colors: ReadingThemeColors;
}
