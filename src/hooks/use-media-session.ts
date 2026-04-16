"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";

const SEEK_STEP_MS = 10_000;

export function useMediaSession(): void {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const positionMs = usePlayerStore((s) => s.playback.positionMs);
  const durationMs = usePlayerStore((s) => s.playback.durationMs);
  const rate = usePlayerStore((s) => s.playback.rate);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const skipToPrevious = usePlayerStore((s) => s.skipToPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: currentTrack.artwork
        ? [{ src: currentTrack.artwork, sizes: "256x256", type: "image/jpeg" }]
        : [],
    });
  }, [currentTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const duration = durationMs / 1000;
    const position = Math.min(positionMs / 1000, duration || 0);
    if (!Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position,
        playbackRate: rate || 1,
      });
    } catch {
      // Some browsers throw on invalid state; ignore.
    }
  }, [positionMs, durationMs, rate]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => play());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => skipToNext());
    navigator.mediaSession.setActionHandler("previoustrack", () => skipToPrevious());

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") {
        seekTo(details.seekTime * 1000);
      }
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const step = (details.seekOffset ?? SEEK_STEP_MS / 1000) * 1000;
      const { playback } = usePlayerStore.getState();
      seekTo(Math.min(playback.positionMs + step, playback.durationMs));
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const step = (details.seekOffset ?? SEEK_STEP_MS / 1000) * 1000;
      const { playback } = usePlayerStore.getState();
      seekTo(Math.max(playback.positionMs - step, 0));
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
    };
  }, [play, pause, skipToNext, skipToPrevious, seekTo]);
}
