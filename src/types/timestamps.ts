export interface AyahTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
}

export interface AyahTimestampsResponse {
  data: {
    rewayat_id: string;
    surah: number;
    timestamps: AyahTimestamp[];
  };
}

export interface RewayatRef {
  id: string;
  mp3quran_read_id: number | null;
  qdc_reciter_id: number | null;
  has_timestamps?: boolean;
  timestamps_surah_list?: number[];
}
