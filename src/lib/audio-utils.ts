import type { Track } from "@/types/audio";
import type { Reciter, Rewayat } from "@/types/reciter";

export function buildAudioUrl(server: string, surahNumber: number): string {
  const padded = surahNumber.toString().padStart(3, "0");
  return `${server}/${padded}.mp3`;
}

export function createTrack(
  reciter: Reciter,
  rewayat: Rewayat,
  surahId: number,
  surahName: string,
): Track {
  return {
    id: `${reciter.id}:${rewayat.id}:${surahId}`,
    url: buildAudioUrl(rewayat.server, surahId),
    title: surahName,
    artist: reciter.name,
    artwork: reciter.image_url ?? "",
    duration: 0,
    reciterId: reciter.id,
    reciterName: reciter.name,
    surahId,
    rewayatId: rewayat.id,
  };
}

export function createQueueFromSurah(
  reciter: Reciter,
  rewayat: Rewayat,
  startSurahId: number,
  surahNames: Record<number, string>,
): { tracks: Track[]; startIndex: number } {
  const surahList = rewayat.surah_list;
  const startIdx = surahList.indexOf(startSurahId);
  if (startIdx === -1) return { tracks: [], startIndex: 0 };

  const reordered = [...surahList.slice(startIdx), ...surahList.slice(0, startIdx)];
  const tracks = reordered.map((surahId) =>
    createTrack(reciter, rewayat, surahId, surahNames[surahId] ?? `Surah ${surahId}`),
  );
  return { tracks, startIndex: 0 };
}
