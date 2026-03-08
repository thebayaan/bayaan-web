export interface Reciter {
  id: string;
  name: string;
  date: string | null;
  image_url: string | null;
  rewayat: Rewayat[];
}

export interface Rewayat {
  id: string;
  reciter_id: string;
  name: string;
  style: string;
  server: string;
  surah_total: number;
  surah_list: (number | null)[];
  source_type: string;
  created_at: string;
  mp3quran_read_id?: number;
  qdc_reciter_id?: number;
}

export interface RewayatStyle {
  id: string;
  name: string;
  style: string;
  surah_list?: (number | null)[];
}
