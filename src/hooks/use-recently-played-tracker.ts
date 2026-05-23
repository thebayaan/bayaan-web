"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { useRecentlyPlayedStore } from "@/stores/recently-played-store";

/**
 * Adds a new entry to the recently-played store whenever the current
 * track changes to one we haven't just added. Mounted once near the
 * audio root (BottomPlayerBar).
 */
export function useRecentlyPlayedTracker(): void {
  const currentTrack = usePlayerStore((s) => {
    const tracks = s.queue.tracks;
    return tracks[s.queue.currentIndex];
  });
  const push = useRecentlyPlayedStore((s) => s.push);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentTrack) return;
    const key = `${currentTrack.reciterId}/${currentTrack.rewayatId}/${currentTrack.surahId}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    push({
      reciterId: currentTrack.reciterId,
      rewayatId: currentTrack.rewayatId,
      surahId: currentTrack.surahId,
      reciterName: currentTrack.artist,
      surahName: currentTrack.title,
      artwork: currentTrack.artwork || null,
    });
  }, [currentTrack, push]);
}
