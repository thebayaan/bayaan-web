export type RecitationStyle = "murattal" | "mojawwad" | "molim";

export interface Rewayat {
  id: string;
  reciter_id: string;
  name: string;
  style: RecitationStyle;
  server: string;
  source_type: string;
  surah_total: number;
  surah_list: number[];
  mp3quran_read_id: number | null;
  qdc_reciter_id: number | null;
}

export interface Reciter {
  id: string;
  name: string;
  name_arabic?: string;
  slug: string;
  date?: string;
  image_url?: string;
  bio?: string;
  is_featured: boolean;
  rewayat: Rewayat[];
}
