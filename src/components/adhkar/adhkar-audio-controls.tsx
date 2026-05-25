"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon, RepeatIcon } from "@/components/icons";
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
}

export function AdhkarAudioControls({ audioUrl }: AdhkarAudioControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  const seek = useCallback(
    (nextProgress: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = nextProgress * duration;
    },
    [duration],
  );

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="mb-8 w-full max-w-md">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        onChange={(event) => seek(Number(event.target.value))}
        aria-label="Audio progress"
        className="accent-foreground mb-3 h-1 w-full cursor-pointer"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground w-10 text-xs tabular-nums">{formatTime(currentTime)}</span>

        <div className="flex items-center gap-2">
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

        <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
