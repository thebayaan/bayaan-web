export interface AyahTimestamp {
  surahNumber: number;
  ayahNumber: number;
  timestampFrom: number;
  timestampTo: number;
  durationMs: number;
}

export interface AyahTrackingState {
  surahNumber: number;
  ayahNumber: number;
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
}

export type TimestampSource = 'mp3quran' | 'qdc' | 'local';

export interface Mp3QuranAyahTiming {
  ayah: number;
  start_time: number;
  end_time: number;
}

export interface QdcAudioFileResponse {
  audio_files: QdcAudioFile[];
}

export interface QdcAudioFile {
  verse_timings: QdcVerseTiming[];
}

export interface QdcVerseTiming {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  segments: number[][];
}
