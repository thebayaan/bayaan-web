'use client';

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Divider } from "@/components/ui/Divider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2 } from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { getAudioService } from "@/lib/audioService";

/**
 * PlayerBar — sticky bottom audio player bar with full functionality
 */
export function PlayerBar() {
  const {
    playback,
    loading,
    error,
    getCurrentTrack,
    hasNextTrack,
    hasPreviousTrack,
    play,
    pause,
    skipNext,
    skipPrevious,
    setSheetMode,
  } = usePlayerStore();

  const [volume, setVolume] = useState(0.75);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [tempPosition, setTempPosition] = useState(0);

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const currentTrack = getCurrentTrack();
  const audioService = getAudioService();

  // Initialize audio service volume
  useEffect(() => {
    if (typeof window !== "undefined" && audioService.setVolume) {
      audioService.setVolume(volume);
    }
  }, [audioService, volume]);

  // Format time helpers
  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress bar handlers
  const handleProgressMouseDown = (e: React.MouseEvent) => {
    if (!progressRef.current || !playback.duration) return;

    setIsDraggingProgress(true);
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const position = percent * playback.duration;
    setTempPosition(position);

    const handleMouseMove = (e: MouseEvent) => {
      if (!progressRef.current || !playback.duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const position = percent * playback.duration;
      setTempPosition(position);
    };

    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      if (audioService.seekTo) {
        audioService.seekTo(tempPosition);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Volume bar handlers
  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    if (!volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    setVolume(newVolume);

    const handleMouseMove = (e: MouseEvent) => {
      if (!volumeRef.current) return;
      const rect = volumeRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(percent);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Play/pause handler
  const handlePlayPause = async () => {
    try {
      if (playback.state === "playing") {
        pause();
      } else if (currentTrack) {
        await play();
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  // Skip handlers
  const handleSkipPrevious = async () => {
    try {
      await skipPrevious();
    } catch (error) {
      console.error("Skip previous error:", error);
    }
  };

  const handleSkipNext = async () => {
    try {
      await skipNext();
    } catch (error) {
      console.error("Skip next error:", error);
    }
  };

  // Open player sheet handler
  const handleOpenPlayerSheet = () => {
    if (currentTrack) {
      setSheetMode('full');
    }
  };

  // Calculate progress percentage
  const currentPosition = isDraggingProgress ? tempPosition : playback.position;
  const progressPercent = playback.duration > 0 ? (currentPosition / playback.duration) * 100 : 0;

  // Determine if controls should be disabled
  const isLoading = loading.trackLoading || playback.state === "loading";
  const canPlay = currentTrack && (playback.state === "ready" || playback.state === "paused" || playback.state === "playing");
  const canSkipNext = hasNextTrack();
  const canSkipPrevious = hasPreviousTrack();
  return (
    <footer
      className={cn(
        "flex items-center gap-4 px-5",
        "h-[72px] shrink-0",
        "border-t",
      )}
      style={{ borderColor: "var(--color-divider)" }}
      aria-label="Audio player"
    >
      {/* Track info */}
      <button
        className={cn(
          "flex items-center gap-3 w-[220px] shrink-0 text-left",
          "rounded-lg px-2 py-1 -mx-2 -my-1",
          "transition-all duration-150",
          currentTrack
            ? "hover:bg-[var(--color-hover)] cursor-pointer"
            : "cursor-default"
        )}
        onClick={handleOpenPlayerSheet}
        disabled={!currentTrack}
        aria-label={currentTrack ? "Open full player" : undefined}
      >
        {/* Album art placeholder */}
        <div
          className="h-10 w-10 rounded-lg shrink-0"
          style={{ backgroundColor: "var(--color-card)" }}
          aria-hidden="true"
        >
          <div className="h-full w-full rounded-lg flex items-center justify-center">
            <Volume2
              size={14}
              style={{ color: "var(--color-icon)" }}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span
            className="text-xs font-medium truncate"
            style={{ color: currentTrack ? "var(--color-label)" : "var(--color-hint)" }}
          >
            {currentTrack?.title || "No track playing"}
          </span>
          <span
            className="text-[11px] truncate"
            style={{ color: "var(--color-hint)" }}
          >
            {currentTrack?.reciterName || "Select a reciter to begin"}
          </span>
        </div>
      </button>

      <Divider orientation="vertical" className="h-6" />

      {/* Controls — center */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* Transport buttons */}
        <div className="flex items-center gap-3">
          <PlayerControlBtn
            label="Previous track"
            disabled={!canSkipPrevious}
            onClick={handleSkipPrevious}
          >
            <SkipBack size={16} strokeWidth={1.8} />
          </PlayerControlBtn>

          <button
            aria-label={playback.state === "playing" ? "Pause" : "Play"}
            disabled={!canPlay || isLoading}
            onClick={handlePlayPause}
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center",
              "transition-all duration-150",
              !canPlay || isLoading
                ? "opacity-40 cursor-not-allowed"
                : "hover:opacity-90 active:scale-95",
            )}
            style={{
              backgroundColor: "var(--color-text)",
              color: "var(--color-background)",
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : playback.state === "playing" ? (
              <Pause size={16} strokeWidth={2} />
            ) : (
              <Play size={16} strokeWidth={2} className="translate-x-0.5" />
            )}
          </button>

          <PlayerControlBtn
            label="Next track"
            disabled={!canSkipNext}
            onClick={handleSkipNext}
          >
            <SkipForward size={16} strokeWidth={1.8} />
          </PlayerControlBtn>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm flex items-center gap-2">
          <span
            className="text-[10px] tabular-nums w-7 text-right"
            style={{ color: "var(--color-hint)" }}
          >
            {formatTime(currentPosition)}
          </span>
          <div
            ref={progressRef}
            className="flex-1 h-1 rounded-full overflow-hidden cursor-pointer"
            style={{ backgroundColor: "var(--color-card)" }}
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                backgroundColor: "var(--color-icon)",
                width: `${Math.max(0, Math.min(100, progressPercent))}%`,
              }}
            />
          </div>
          <span
            className="text-[10px] tabular-nums w-7"
            style={{ color: "var(--color-hint)" }}
          >
            {formatTime(playback.duration)}
          </span>
        </div>
      </div>

      <Divider orientation="vertical" className="h-6" />

      {/* Volume — right */}
      <div className="w-[220px] shrink-0 flex items-center justify-end gap-2">
        {volume === 0 ? (
          <VolumeX
            size={14}
            strokeWidth={1.5}
            style={{ color: "var(--color-icon)" }}
          />
        ) : (
          <Volume2
            size={14}
            strokeWidth={1.5}
            style={{ color: "var(--color-icon)" }}
          />
        )}
        <div
          ref={volumeRef}
          className="w-20 h-1 rounded-full overflow-hidden cursor-pointer"
          style={{ backgroundColor: "var(--color-card)" }}
          onMouseDown={handleVolumeMouseDown}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              backgroundColor: "var(--color-icon)",
              width: `${volume * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Error display */}
      {error.playback && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs px-3 py-1">
          {error.playback.message}
        </div>
      )}
    </footer>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function PlayerControlBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center",
        "transition-all duration-150",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-[var(--color-hover)] text-[var(--color-icon)] hover:text-[var(--color-label)] active:scale-95",
      )}
      style={{ color: "var(--color-icon)" }}
    >
      {children}
    </button>
  );
}
