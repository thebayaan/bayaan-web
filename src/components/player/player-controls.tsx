"use client";

import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ShuffleIcon,
  RepeatIcon,
  RepeatOneIcon,
} from "@/components/icons";
import type { RepeatMode } from "@/types/audio";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  /** True while the current track is loading (after updateQueue / skipToIndex
   * but before audioService.play has resolved). Drives a spinner on the
   * play/pause button and disables it to prevent re-triggers. */
  isLoading?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  repeatMode: RepeatMode;
  onRepeatChange: () => void;
  shuffle: boolean;
  onShuffleToggle: () => void;
  compact?: boolean;
}

export function PlayerControls({
  isPlaying,
  isLoading = false,
  onPlayPause,
  onNext,
  onPrevious,
  repeatMode,
  onRepeatChange,
  shuffle,
  onShuffleToggle,
  compact,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {!compact && (
        <button
          onClick={onShuffleToggle}
          className={cn(
            "relative rounded-full p-1.5 transition-colors",
            shuffle ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
        >
          <ShuffleIcon size={18} color="currentColor" />
          {shuffle ? (
            <span className="bg-foreground absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
          ) : null}
        </button>
      )}

      <button
        onClick={onPrevious}
        className="text-muted-foreground hover:text-foreground p-1.5 transition-colors"
        aria-label="Previous track"
      >
        <PreviousIcon size={compact ? 16 : 20} />
      </button>

      <button
        onClick={onPlayPause}
        disabled={isLoading}
        aria-busy={isLoading}
        className={cn(
          "text-foreground flex items-center justify-center transition-transform hover:scale-110 disabled:cursor-wait disabled:hover:scale-100",
          compact ? "h-8 w-8" : "h-9 w-9",
        )}
        aria-label={isLoading ? "Loading…" : isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <Spinner size={compact ? 20 : 24} />
        ) : isPlaying ? (
          <PauseIcon size={compact ? 22 : 26} color="currentColor" />
        ) : (
          <PlayIcon size={compact ? 22 : 26} color="currentColor" />
        )}
      </button>

      <button
        onClick={onNext}
        className="text-muted-foreground hover:text-foreground p-1.5 transition-colors"
        aria-label="Next track"
      >
        <NextIcon size={compact ? 16 : 20} />
      </button>

      {!compact && (
        <button
          onClick={onRepeatChange}
          className={cn(
            "relative rounded-full p-1.5 transition-colors",
            repeatMode !== "none"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={`Repeat: ${repeatMode}`}
        >
          {repeatMode === "track" ? (
            <RepeatOneIcon size={18} color="currentColor" />
          ) : (
            <RepeatIcon size={18} color="currentColor" />
          )}
          {repeatMode !== "none" ? (
            <span className="bg-foreground absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
          ) : null}
        </button>
      )}
    </div>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
