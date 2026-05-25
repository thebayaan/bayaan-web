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

/**
 * Minimal shape consumed by the timestamp helpers. The full Rewayat
 * from the reciters API carries more fields; this is just what the
 * client needs to know whether to attempt a CDN fetch for a given surah.
 */
export interface RewayatRef {
  id: string;
  has_timestamps?: boolean;
  timestamps_surah_list?: number[];
}
