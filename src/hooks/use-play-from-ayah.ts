"use client";

import { useCallback, useMemo } from "react";
import type { QcfVerse } from "@/types/quran-api";
import type { ResolvedReciter } from "@/components/quran/reciter-picker-dialog";
import { useReciters } from "@/hooks/use-reciters";
import { useReaderPlayerStore } from "@/stores/reader-player-store";
import { usePlayerStore } from "@/stores/player-store";
import { useWordAudioStore } from "@/stores/word-audio-store";
import { createTrack } from "@/lib/audio-utils";
import { fetchBayaan } from "@/lib/api";
import {
  findAyahTimestamp,
  normalizeTimestampsPayload,
  rewayatHasTimestamps,
} from "@/lib/timestamp-fetch";
import type { AyahTimestamp } from "@/types/timestamps";

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

  const availableReciters = useMemo<ResolvedReciter[]>(() => {
    return reciters
      .map((reciter) => {
        const rewayat = reciter.rewayat.find(
          (entry) => entry.surah_list.includes(surahId) && rewayatHasTimestamps(entry, surahId),
        );
        return rewayat ? { reciter, rewayat } : null;
      })
      .filter((entry): entry is ResolvedReciter => entry !== null);
  }, [reciters, surahId]);

  const resolved = useMemo<ResolvedReciter | null>(() => {
    if (!lastReciterId) return null;

    return (
      availableReciters.find(
        (entry) =>
          entry.reciter.id === lastReciterId &&
          (lastRewayatId === null || entry.rewayat.id === lastRewayatId),
      ) ?? null
    );
  }, [availableReciters, lastReciterId, lastRewayatId]);

  const canPlayFromAyah = availableReciters.length > 0;

  const playFromAyah = useCallback(
    async (verse: QcfVerse, choice?: ResolvedReciter): Promise<void> => {
      const target = choice ?? resolved;
      if (!target) {
        throw new Error("Choose a reciter first.");
      }
      if (!rewayatHasTimestamps(target.rewayat, surahId)) {
        throw new Error("Timestamps are not available for this reciter.");
      }

      stopWordAudio();

      const timestamps = await fetchAyahTimestamps(target.rewayat.id, surahId);
      const ayahTimestamp = findAyahTimestamp(timestamps, surahId, verse.verse_number);

      if (!ayahTimestamp) {
        throw new Error(`No timing data for verse ${verse.verse_key}.`);
      }

      let audioUrl: string;
      try {
        const audioResponse = await fetchBayaan<AudioUrlResponse>(
          `audio-url?rewayat_id=${target.rewayat.id}&surah=${surahId}`,
        );
        audioUrl = audioResponse.data.url;
      } catch {
        audioUrl = createTrack(target.reciter, target.rewayat, surahId, surahName).url;
      }

      const track = {
        ...createTrack(target.reciter, target.rewayat, surahId, surahName),
        url: audioUrl,
      };

      setLastReciter(target.reciter.id, target.rewayat.id);
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
    availableReciters,
    resolvedReciter: resolved,
  };
}
