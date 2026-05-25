"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon, RepeatIcon } from "@/components/icons";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface AdhkarAudioControlsProps {
  audioUrl: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function AdhkarAudioControls({ audioUrl, autoPlay = false, onEnded }: AdhkarAudioControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    audio.src = audioUrl;
    audio.load();
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.loop = isLooping;
  }, [isLooping]);

  useEffect(() => {
    if (!autoPlay) return;
    const audio = audioRef.current;
    if (!audio) return;

    const tryPlay = () => {
      usePlayerStore.getState().pause();
      void audio.play().catch(() => {
        // Browser blocked autoplay or the clip failed to load.
      });
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      tryPlay();
      return;
    }

    audio.addEventListener("loadedmetadata", tryPlay, { once: true });
    return () => audio.removeEventListener("loadedmetadata", tryPlay);
  }, [audioUrl, autoPlay]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    usePlayerStore.getState().pause();
    try {
      await audio.play();
    } catch {
      // Browser blocked autoplay or the clip failed to load.
    }
  }, [isPlaying]);

  const seekToProgress = useCallback(
    (progress: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = (progress / 100) * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = isDragging ? dragValue : progress;
  const displayTime = isDragging ? (dragValue / 100) * duration : currentTime;

  const handleValueChange = useCallback((value: number | readonly number[]) => {
    const v = typeof value === "number" ? value : (value[0] ?? 0);
    setDragValue(v);
    setIsDragging(true);
  }, []);

  const handleValueCommitted = useCallback(
    (value: number | readonly number[]) => {
      const v = typeof value === "number" ? value : (value[0] ?? 0);
      seekToProgress(v);
      setIsDragging(false);
    },
    [seekToProgress],
  );

  return (
    <div className="mb-8 w-full max-w-md">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => {
          if (!isDragging) setCurrentTime(audioRef.current?.currentTime ?? 0);
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
      />

      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-muted-foreground w-10 shrink-0 text-right text-[10px] tabular-nums">
          {formatTime(displayTime)}
        </span>
        <Slider
          value={displayProgress}
          max={100}
          step={0.1}
          onValueChange={handleValueChange}
          onValueCommitted={handleValueCommitted}
          className="flex-1"
        />
        <span className="text-muted-foreground w-10 shrink-0 text-[10px] tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => void togglePlay()}
          className="text-foreground flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text-alpha-06)] transition-transform hover:scale-105"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>

        <button
          type="button"
          onClick={() => setIsLooping((value) => !value)}
          className={cn(
            "rounded-full p-2 transition-colors",
            isLooping ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={isLooping ? "Disable loop" : "Enable loop"}
          aria-pressed={isLooping}
        >
          <RepeatIcon size={18} color="currentColor" />
        </button>
      </div>
    </div>
  );
}
