"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { useAyahTrackerStore } from "@/stores/ayah-tracker-store";
import type { AyahTimestamp } from "@/types/timestamps";

async function loadTimestamps(rewayatId: string, surahId: number): Promise<AyahTimestamp[]> {
  const response = await fetch(`/api/timestamps/${rewayatId}/${surahId}`);
  if (!response.ok) return [];
  const body = (await response.json()) as { data: { timestamps: AyahTimestamp[] } };
  return body.data.timestamps;
}

/**
 * Loads ayah timestamps whenever the main player switches to a new
 * recitation track. Clears state when the queue has no track.
 */
export function useTimestampLoader(): void {
  const currentTrack = usePlayerStore((s) => {
    const { tracks, currentIndex } = s.queue;
    return tracks[currentIndex] ?? null;
  });

  useEffect(() => {
    if (!currentTrack) {
      useAyahTrackerStore.getState().clear();
      return;
    }

    const cacheKey = `${currentTrack.rewayatId}:${currentTrack.surahId}`;
    const { cacheKey: loadedKey } = useAyahTrackerStore.getState();
    if (loadedKey === cacheKey) return;

    let cancelled = false;

    void loadTimestamps(currentTrack.rewayatId, currentTrack.surahId).then((timestamps) => {
      if (cancelled || timestamps.length === 0) return;
      useAyahTrackerStore.getState().setTimestamps(cacheKey, currentTrack.surahId, timestamps);
    });

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id, currentTrack?.rewayatId, currentTrack?.surahId]);
}
