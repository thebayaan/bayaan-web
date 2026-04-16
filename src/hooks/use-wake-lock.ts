"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";

interface WakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (event: "release", handler: () => void) => void;
}

interface WakeLock {
  request: (type: "screen") => Promise<WakeLockSentinel>;
}

function getWakeLockApi(): WakeLock | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { wakeLock?: WakeLock };
  return nav.wakeLock ?? null;
}

export function useWakeLock(): void {
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);

  useEffect(() => {
    const api = getWakeLockApi();
    if (!api || !isPlaying) return;

    let sentinel: WakeLockSentinel | null = null;
    let disposed = false;

    const acquire = async (): Promise<void> => {
      try {
        const next = await api.request("screen");
        if (disposed) {
          await next.release();
          return;
        }
        sentinel = next;
      } catch {
        // User gesture missing, permission denied, or tab hidden.
      }
    };

    const handleVisibility = (): void => {
      if (document.visibilityState === "visible" && !sentinel) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (sentinel && !sentinel.released) {
        void sentinel.release();
      }
    };
  }, [isPlaying]);
}
