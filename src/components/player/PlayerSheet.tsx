'use client';

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  ChevronDown,
  Shuffle,
  Repeat,
  Repeat1,
  Clock,
  MoreHorizontal
} from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { getAudioService } from "@/lib/audioService";
import type { RepeatMode } from "@/types/player";
import surahData from "@/data/surahData.json";
import type { Surah } from "@/types/quran";

/**
 * PlayerSheet — Full-screen player interface with advanced controls
 * Displays when player store sheetMode is set to 'full'
 */
export function PlayerSheet() {
  const {
    playback,
    loading,
    error,
    settings,
    ui,
    getCurrentTrack,
    hasNextTrack,
    hasPreviousTrack,
    play,
    pause,
    skipNext,
    skipPrevious,
    setSheetMode,
    setRepeatMode,
    toggleShuffle,
    setSleepTimer,
  } = usePlayerStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const currentTrack = getCurrentTrack();
  const audioService = getAudioService();

  // Get surah name from surahId
  const getSurahName = (surahId?: string): string | undefined => {
    if (!surahId) return undefined;
    const surah = (surahData as Surah[]).find(s => s.id.toString() === surahId);
    return surah?.name;
  };

  // Close sheet on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheetMode('hidden');
      }
    };

    if (ui.sheetMode === 'full') {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [ui.sheetMode, setSheetMode]);

  // Don't render if not in full mode
  if (ui.sheetMode !== 'full') {
    return null;
  }

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress bar handlers
  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !playback.duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const position = percent * playback.duration;

    if (audioService.seekTo) {
      audioService.seekTo(position);
    }
  };

  // Volume control
  const handleVolumeClick = (e: React.MouseEvent) => {
    if (!volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const volume = Math.max(0, Math.min(1, percent));

    if (audioService.setVolume) {
      audioService.setVolume(volume);
    }
  };

  // Playback controls
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

  // Settings handlers
  const handleRepeatMode = () => {
    const modes: RepeatMode[] = ['none', 'queue', 'track'];
    const currentIndex = modes.indexOf(settings.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const handleSleepTimer = () => {
    // Cycle through sleep timer options: 0, 15, 30, 60 minutes
    const options = [0, 15, 30, 60];
    const currentIndex = options.indexOf(settings.sleepTimer);
    const nextTimer = options[(currentIndex + 1) % options.length];
    setSleepTimer(nextTimer);
  };

  // Calculate progress percentage
  const progressPercent = playback.duration > 0 ? (playback.position / playback.duration) * 100 : 0;
  const currentVolume = audioService.getVolume ? audioService.getVolume() : 0.75;

  // Determine loading and control states
  const isLoading = loading.trackLoading || playback.state === "loading";
  const canPlay = currentTrack && (playback.state === "ready" || playback.state === "paused" || playback.state === "playing");

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
      aria-label="Full player"
      role="dialog"
      aria-modal="true"
    >
      {/* Header with close button */}
      <header className="flex items-center justify-between p-5 shrink-0">
        <button
          onClick={() => setSheetMode('hidden')}
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            "transition-colors duration-150",
            "hover:bg-[var(--color-hover)]"
          )}
          aria-label="Close player"
        >
          <ChevronDown size={20} style={{ color: "var(--color-icon)" }} />
        </button>

        <span
          className="text-sm font-medium"
          style={{ color: "var(--color-label)" }}
        >
          Now Playing
        </span>

        <button
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            "transition-colors duration-150",
            "hover:bg-[var(--color-hover)]"
          )}
          aria-label="More options"
        >
          <MoreHorizontal size={18} style={{ color: "var(--color-icon)" }} />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Album art */}
        <div className="w-80 h-80 mb-8 rounded-2xl overflow-hidden shadow-lg">
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "var(--color-card)" }}
          >
            <Volume2
              size={80}
              style={{ color: "var(--color-icon)" }}
              strokeWidth={1}
            />
          </div>
        </div>

        {/* Track info */}
        <div className="text-center mb-8 max-w-md">
          <h1
            className="text-2xl font-semibold mb-2 truncate"
            style={{ color: "var(--color-text)" }}
          >
            {currentTrack?.title || "No track playing"}
          </h1>
          <p
            className="text-lg truncate"
            style={{ color: "var(--color-hint)" }}
          >
            {currentTrack?.reciterName || "Select a reciter to begin"}
          </p>
          {currentTrack?.surahId && (
            <p
              className="text-sm mt-1 truncate"
              style={{ color: "var(--color-hint)" }}
            >
              {getSurahName(currentTrack.surahId)}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-lg mb-6">
          <div
            ref={progressRef}
            className="h-2 rounded-full cursor-pointer mb-2"
            style={{ backgroundColor: "var(--color-card)" }}
            onClick={handleProgressClick}
          >
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                backgroundColor: "var(--color-text)",
                width: `${Math.max(0, Math.min(100, progressPercent))}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--color-hint)" }}>
              {formatTime(playback.position)}
            </span>
            <span style={{ color: "var(--color-hint)" }}>
              {formatTime(playback.duration)}
            </span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-6 mb-8">
          <button
            aria-label="Previous track"
            disabled={!hasPreviousTrack()}
            onClick={handleSkipPrevious}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              "transition-all duration-150",
              !hasPreviousTrack()
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-[var(--color-hover)] active:scale-95",
            )}
          >
            <SkipBack size={24} style={{ color: "var(--color-icon)" }} />
          </button>

          <button
            aria-label={playback.state === "playing" ? "Pause" : "Play"}
            disabled={!canPlay || isLoading}
            onClick={handlePlayPause}
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center",
              "transition-all duration-150 shadow-lg",
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
              <Loader2 size={28} className="animate-spin" />
            ) : playback.state === "playing" ? (
              <Pause size={28} strokeWidth={2} />
            ) : (
              <Play size={28} strokeWidth={2} className="translate-x-1" />
            )}
          </button>

          <button
            aria-label="Next track"
            disabled={!hasNextTrack()}
            onClick={handleSkipNext}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              "transition-all duration-150",
              !hasNextTrack()
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-[var(--color-hover)] active:scale-95",
            )}
          >
            <SkipForward size={24} style={{ color: "var(--color-icon)" }} />
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-3 mb-8 w-full max-w-sm">
          <VolumeX size={16} style={{ color: "var(--color-icon)" }} />
          <div
            ref={volumeRef}
            className="flex-1 h-2 rounded-full cursor-pointer"
            style={{ backgroundColor: "var(--color-card)" }}
            onClick={handleVolumeClick}
          >
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                backgroundColor: "var(--color-icon)",
                width: `${currentVolume * 100}%`,
              }}
            />
          </div>
          <Volume2 size={16} style={{ color: "var(--color-icon)" }} />
        </div>
      </main>

      {/* Bottom controls */}
      <footer className="px-8 pb-8 shrink-0">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={handleSleepTimer}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "transition-colors duration-150",
              "hover:bg-[var(--color-hover)]",
              settings.sleepTimer > 0 && "bg-[var(--color-card)]"
            )}
            aria-label={`Sleep timer: ${settings.sleepTimer > 0 ? `${settings.sleepTimer} minutes` : 'Off'}`}
          >
            <Clock size={16} style={{ color: "var(--color-icon)" }} />
            <span
              className="text-sm"
              style={{ color: "var(--color-label)" }}
            >
              {settings.sleepTimer > 0 ? `${settings.sleepTimer}m` : 'Sleep'}
            </span>
          </button>

          <button
            onClick={handleRepeatMode}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "transition-colors duration-150",
              "hover:bg-[var(--color-hover)]",
              settings.repeatMode !== 'none' && "bg-[var(--color-card)]"
            )}
            aria-label={`Repeat: ${settings.repeatMode}`}
          >
            {settings.repeatMode === 'track' ? (
              <Repeat1 size={16} style={{ color: "var(--color-icon)" }} />
            ) : (
              <Repeat size={16} style={{ color: "var(--color-icon)" }} />
            )}
            <span
              className="text-sm capitalize"
              style={{ color: "var(--color-label)" }}
            >
              {settings.repeatMode === 'none' ? 'Repeat' : settings.repeatMode}
            </span>
          </button>

          <button
            onClick={toggleShuffle}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "transition-colors duration-150",
              "hover:bg-[var(--color-hover)]",
              settings.shuffle && "bg-[var(--color-card)]"
            )}
            aria-label={`Shuffle: ${settings.shuffle ? 'On' : 'Off'}`}
          >
            <Shuffle size={16} style={{ color: "var(--color-icon)" }} />
            <span
              className="text-sm"
              style={{ color: "var(--color-label)" }}
            >
              Shuffle
            </span>
          </button>
        </div>
      </footer>

      {/* Error display */}
      {error.playback && (
        <div
          className="absolute top-16 left-4 right-4 rounded-lg p-3 text-center"
          style={{ backgroundColor: "rgb(239 68 68)", color: "white" }}
        >
          <span className="text-sm">{error.playback.message}</span>
        </div>
      )}
    </div>
  );
}