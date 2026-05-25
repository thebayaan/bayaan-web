"use client";

import { useCallback, useMemo } from "react";
import type { QcfVerse } from "@/types/quran-api";
import type { Reciter, Rewayat } from "@/types/reciter";
import { useReciters } from "@/hooks/use-reciters";
import { useReaderPlayerStore } from "@/stores/reader-player-store";
import { usePlayerStore } from "@/stores/player-store";
import { useWordAudioStore } from "@/stores/word-audio-store";
import { createTrack } from "@/lib/audio-utils";
import { fetchBayaan } from "@/lib/api";
import { findAyahTimestamp, normalizeTimestampsPayload, rewayatHasTimestamps } from "@/lib/timestamp-fetch";
import type { AyahTimestamp } from "@/types/timestamps";

interface ResolvedReaderReciter {
  reciter: Reciter;
  rewayat: Rewayat;
}

interface AudioUrlResponse {
  data: { url: string };
}

async function fetchAyahTimestamps(rewayatId: string, surah: number): Promise<AyahTimestamp[]> {
  const response = await fetch(`/api/timestamps/${rewayatId}/${surah}`);
  if (!response.ok) {
    throw new Error(`Timestamps unavailable (${response.status})`);
  }
  const body = (await response.json()) as { data: { timestamps: unknown } };
  return normalizeTimestampsPayload(surah, body.data.timestamps);
}

export function usePlayFromAyah(surahId: number, surahName: string) {
  const { reciters } = useReciters();
  const lastReciterId = useReaderPlayerStore((s) => s.lastReciterId);
  const lastRewayatId = useReaderPlayerStore((s) => s.lastRewayatId);
  const setLastReciter = useReaderPlayerStore((s) => s.setLastReciter);
  const updateQueue = usePlayerStore((s) => s.updateQueue);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const stopWordAudio = useWordAudioStore((s) => s.stop);

  const resolved = useMemo<ResolvedReaderReciter | null>(() => {
    if (!lastReciterId) return null;

    const reciter = reciters.find((entry) => entry.id === lastReciterId);
    if (!reciter) return null;

    const rewayat =
      reciter.rewayat.find(
        (entry) =>
          entry.surah_list.includes(surahId) &&
          (lastRewayatId === null || entry.id === lastRewayatId),
      ) ?? reciter.rewayat.find((entry) => entry.surah_list.includes(surahId));

    return rewayat ? { reciter, rewayat } : null;
  }, [reciters, lastReciterId, lastRewayatId, surahId]);

  const canPlayFromAyah = useMemo(() => {
    if (!resolved) return false;
    return rewayatHasTimestamps(resolved.rewayat, surahId);
  }, [resolved, surahId]);

  const playFromAyah = useCallback(
    async (verse: QcfVerse): Promise<void> => {
      if (!resolved) {
        throw new Error("Choose a reciter from the header player first.");
      }
      if (!rewayatHasTimestamps(resolved.rewayat, surahId)) {
        throw new Error("Timestamps are not available for this reciter.");
      }

      stopWordAudio();

      const timestamps = await fetchAyahTimestamps(resolved.rewayat.id, surahId);
      const ayahTimestamp = findAyahTimestamp(timestamps, surahId, verse.verse_number);

      if (!ayahTimestamp) {
        throw new Error(`No timing data for verse ${verse.verse_key}.`);
      }

      let audioUrl: string;
      try {
        const audioResponse = await fetchBayaan<AudioUrlResponse>(
          `audio-url?rewayat_id=${resolved.rewayat.id}&surah=${surahId}`,
        );
        audioUrl = audioResponse.data.url;
      } catch {
        audioUrl = createTrack(resolved.reciter, resolved.rewayat, surahId, surahName).url;
      }

      const track = {
        ...createTrack(resolved.reciter, resolved.rewayat, surahId, surahName),
        url: audioUrl,
      };

      setLastReciter(resolved.reciter.id, resolved.rewayat.id);
      await updateQueue([track]);
      pause();
      seekTo(ayahTimestamp.timestamp_from);
      await play();
    },
    [resolved, surahId, surahName, stopWordAudio, setLastReciter, updateQueue, pause, seekTo, play],
  );

  return {
    playFromAyah,
    canPlayFromAyah,
    resolvedReciter: resolved,
  };
}
