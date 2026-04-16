"use client";

import { PlayIcon, PauseIcon, NextIcon, PreviousIcon } from "@/components/icons";
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
            "rounded-full p-1.5 transition-colors",
            shuffle ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
          </svg>
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
          "bg-foreground text-background flex items-center justify-center rounded-full transition-transform hover:scale-105",
          compact ? "h-8 w-8" : "h-9 w-9",
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <PauseIcon size={compact ? 14 : 16} color="currentColor" />
        ) : (
          <PlayIcon size={compact ? 14 : 16} color="currentColor" />
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
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          {repeatMode === "track" && (
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
              1
            </span>
          )}
        </button>
      )}
    </div>
  );
}
