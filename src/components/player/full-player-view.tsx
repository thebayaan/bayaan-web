"use client";

import Image from "next/image";
import { usePlayerStore } from "@/stores/player-store";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";
import type { RepeatMode } from "@/types/audio";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 bg-background border-border overflow-hidden">
        <DialogTitle className="sr-only">Now Playing</DialogTitle>
        <div className="flex flex-col items-center p-8 gap-6">
          {/* Artwork */}
          <div className="w-64 h-64 rounded-2xl overflow-hidden bg-muted shadow-2xl">
            {currentTrack.artwork ? (
              <Image
                src={currentTrack.artwork}
                alt={currentTrack.title}
                width={256}
                height={256}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
          <div className="text-center w-full">
            <h2 className="text-xl font-bold truncate">{currentTrack.title}</h2>
            <p className="text-muted-foreground truncate">
              {currentTrack.artist}
            </p>
          </div>

          {/* Progress */}
          <div className="w-full">
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
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 rounded-full bg-muted transition-colors"
          >
            {settings.rate}x
          </button>

          {/* Queue position */}
          <p className="text-xs text-muted-foreground">
            Track {currentIndex + 1} of {tracks.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
