export interface QcfWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: "word" | "end" | "pause";
  code_v1?: string;
  code_v2: string;
  page_number: number;
  line_number: number;
  text_uthmani: string;
  text_imlaei_simple: string;
  text_qpc_hafs?: string;
  text_indopak?: string;
  qpc_uthmani_hafs: string;
  verse_key: string;
  verse_id: number;
  location: string;
  translation?: { text: string; language_name: string };
  transliteration?: { text: string; language_name: string };
}

export interface QcfVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  page_number: number;
  juz_number: number;
  words: QcfWord[];
  text_uthmani: string;
  chapter_id: number;
  translations?: Array<{
    id: number;
    resource_id: number;
    resource_name: string;
    language_id: number;
    text: string;
  }>;
}

export interface VersesResponse {
  verses: QcfVerse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}
