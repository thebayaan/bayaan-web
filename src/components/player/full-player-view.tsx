"use client";

import Image from "next/image";
import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";
import type { RepeatMode } from "@/types/audio";

interface FullPlayerViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullPlayerView({
  open,
  onOpenChange,
}: FullPlayerViewProps): React.ReactElement | null {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const playback = usePlayerStore((s) => s.playback);
  const settings = usePlayerStore((s) => s.settings);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const skipToPrevious = usePlayerStore((s) => s.skipToPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const setRate = usePlayerStore((s) => s.setRate);

  useEffect((): (() => void) | undefined => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return (): void => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const currentTrack = tracks[currentIndex];

  if (!currentTrack) return null;

  const handlePlayPause = (): void => {
    if (playback.isPlaying) {
      pause();
    } else {
      void play();
    }
  };

  const cycleRepeat = (): void => {
    const modes: RepeatMode[] = ["none", "queue", "track"];
    const idx = modes.indexOf(settings.repeatMode);
    setRepeatMode(modes[(idx + 1) % modes.length]!);
  };

  const cycleRate = (): void => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const idx = rates.indexOf(settings.rate);
    const nextRate = rates[(idx + 1) % rates.length]!;
    setRate(nextRate);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now Playing"
      aria-hidden={!open}
      className={`bg-surface duration-regular ease-standard fixed inset-0 z-50 transition-[transform,opacity] ${
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-full p-2 transition-colors"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Artwork */}
        <div className="bg-muted h-64 w-64 overflow-hidden rounded-2xl shadow-2xl">
          {currentTrack.artwork ? (
            <Image
              src={currentTrack.artwork}
              alt={currentTrack.title}
              width={256}
              height={256}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <svg
                width={64}
                height={64}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 10-16 0" />
              </svg>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="w-full max-w-md text-center">
          <h2 className="truncate text-xl font-bold">{currentTrack.title}</h2>
          <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>

        {/* Progress */}
        <div className="w-full max-w-md">
          <ProgressBar
            positionMs={playback.positionMs}
            durationMs={playback.durationMs}
            onSeek={seekTo}
          />
        </div>

        {/* Controls */}
        <PlayerControls
          isPlaying={playback.isPlaying}
          onPlayPause={handlePlayPause}
          onNext={() => void skipToNext()}
          onPrevious={() => void skipToPrevious()}
          repeatMode={settings.repeatMode}
          onRepeatChange={cycleRepeat}
          shuffle={settings.shuffle}
          onShuffleToggle={toggleShuffle}
        />

        {/* Rate control */}
        <button
          onClick={cycleRate}
          className="text-muted-foreground hover:text-foreground bg-muted rounded-full px-3 py-1 text-xs transition-colors"
        >
          {settings.rate}x
        </button>

        {/* Queue position */}
        <p className="text-muted-foreground text-xs">
          Track {currentIndex + 1} of {tracks.length}
        </p>
      </div>
    </div>
  );
}
