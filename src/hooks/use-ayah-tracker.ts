"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { useAyahTrackerStore } from "@/stores/ayah-tracker-store";
import { binarySearchAyah } from "@/lib/timestamp-utils";

const POLL_MS = 200;

/**
 * Maps the current playback position to an active ayah using loaded
 * timestamps. Runs on an interval while audio is playing.
 */
export function useAyahTracker(): void {
  const positionMs = usePlayerStore((s) => s.playback.positionMs);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const timestamps = useAyahTrackerStore((s) => s.timestamps);

  useEffect(() => {
    if (timestamps.length === 0) {
      useAyahTrackerStore.getState().setActiveVerseKey(null);
      return;
    }
    if (!isPlaying) return;

    const update = () => {
      const ms = usePlayerStore.getState().playback.positionMs;
      const match = binarySearchAyah(timestamps, ms);
      useAyahTrackerStore.getState().setActiveVerseKey(match?.verse_key ?? null);
    };

    update();
    const id = window.setInterval(update, POLL_MS);
    return () => window.clearInterval(id);
  }, [isPlaying, timestamps, positionMs]);
}
