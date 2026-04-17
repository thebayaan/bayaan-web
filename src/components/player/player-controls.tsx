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
        className={cn(
          "text-foreground flex items-center justify-center transition-transform hover:scale-110",
          compact ? "h-8 w-8" : "h-9 w-9",
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
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
