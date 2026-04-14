"use client";

import { useEffect } from "react";
import { audioService } from "@/services/audio/audio-service";
import { usePlayerStore } from "@/stores/player-store";

export function useAudioEvents(): void {
  useEffect(() => {
    const unsubTimeUpdate = audioService.on("timeupdate", () => {
      const positionMs = audioService.getCurrentTime() * 1000;
      const durationMs = audioService.getDuration() * 1000;
      usePlayerStore.getState().updatePlayback({ positionMs, durationMs });
    });

    const unsubEnded = audioService.on("ended", () => {
      usePlayerStore.getState().skipToNext();
    });

    const unsubLoadedMetadata = audioService.on("loadedmetadata", () => {
      const durationMs = audioService.getDuration() * 1000;
      usePlayerStore.getState().updatePlayback({ durationMs });
    });

    const unsubError = audioService.on("error", () => {
      usePlayerStore.getState().updatePlayback({ isPlaying: false });
    });

    return () => {
      unsubTimeUpdate();
      unsubEnded();
      unsubLoadedMetadata();
      unsubError();
    };
  }, []);
}
