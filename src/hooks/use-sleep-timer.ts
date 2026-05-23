"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/stores/player-store";

/**
 * Watches the sleep-timer deadline and pauses playback when reached.
 * Returns the remaining milliseconds (or null when no timer is set)
 * so the UI can show a live countdown.
 *
 * Mounted once near the audio root (see BottomPlayerBar).
 */
export function useSleepTimer(): { remainingMs: number | null } {
  const sleepTimerEndsAt = usePlayerStore((s) => s.settings.sleepTimerEndsAt);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);
  const pause = usePlayerStore((s) => s.pause);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (sleepTimerEndsAt === null) return undefined;
    // Tick once per second so the countdown updates smoothly.
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [sleepTimerEndsAt]);

  useEffect(() => {
    if (sleepTimerEndsAt === null) return;
    if (now >= sleepTimerEndsAt) {
      if (isPlaying) pause();
      setSleepTimer(null);
    }
  }, [now, sleepTimerEndsAt, isPlaying, pause, setSleepTimer]);

  const remainingMs = sleepTimerEndsAt === null ? null : Math.max(0, sleepTimerEndsAt - now);

  return { remainingMs };
}
