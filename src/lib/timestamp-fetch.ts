import type { AyahTimestamp, RewayatRef } from "@/types/timestamps";

const MP3QURAN_TIMING_URL = "https://www.mp3quran.net/api/v3/ayat_timing";
const QDC_AUDIO_URL = "https://api.qurancdn.com/api/qdc/audio/reciters";

interface Mp3QuranAyahTiming {
  ayah: number;
  start_time: number;
  end_time: number;
}

interface QdcVerseTiming {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
}

interface QdcAudioFileResponse {
  audio_files?: Array<{
    verse_timings?: QdcVerseTiming[];
  }>;
}

export function rewayatHasTimestamps(rewayat: RewayatRef, surah: number): boolean {
  if (rewayat.has_timestamps === false) return false;
  if (rewayat.mp3quran_read_id || rewayat.qdc_reciter_id) return true;
  if (!rewayat.has_timestamps) return false;
  if (!rewayat.timestamps_surah_list?.length) return true;
  return rewayat.timestamps_surah_list.includes(surah);
}

export function findAyahTimestamp(
  timestamps: AyahTimestamp[],
  surah: number,
  ayah: number,
): AyahTimestamp | undefined {
  const verseKey = `${surah}:${ayah}`;
  return timestamps.find((entry) => entry.verse_key === verseKey);
}

function normalizeMp3QuranTimings(surah: number, rows: Mp3QuranAyahTiming[]): AyahTimestamp[] {
  return rows.map((row) => ({
    verse_key: `${surah}:${row.ayah}`,
    timestamp_from: row.start_time,
    timestamp_to: row.end_time,
  }));
}

function normalizeQdcTimings(rows: QdcVerseTiming[]): AyahTimestamp[] {
  return rows.map((row) => ({
    verse_key: row.verse_key,
    timestamp_from: row.timestamp_from,
    timestamp_to: row.timestamp_to,
  }));
}

export async function fetchTimestampsForRewayat(
  rewayat: RewayatRef,
  surah: number,
): Promise<AyahTimestamp[]> {
  if (rewayat.mp3quran_read_id) {
    const url = `${MP3QURAN_TIMING_URL}?surah=${surah}&read=${rewayat.mp3quran_read_id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MP3Quran timing error: ${response.status}`);
    }
    const data = (await response.json()) as Mp3QuranAyahTiming[];
    if (!Array.isArray(data) || data.length === 0) return [];
    return normalizeMp3QuranTimings(surah, data);
  }

  if (rewayat.qdc_reciter_id) {
    const url = `${QDC_AUDIO_URL}/${rewayat.qdc_reciter_id}/audio_files?chapter=${surah}&segments=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`QDC timing error: ${response.status}`);
    }
    const data = (await response.json()) as QdcAudioFileResponse;
    const timings = data.audio_files?.[0]?.verse_timings ?? [];
    return normalizeQdcTimings(timings);
  }

  return [];
}
