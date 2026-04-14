"use client";

import { Slider } from "@/components/ui/slider";
import { useCallback, useState } from "react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const [prevVolume, setPrevVolume] = useState(volume);

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      onVolumeChange(prevVolume || 0.5);
    } else {
      setPrevVolume(volume);
    }
    onMuteToggle();
  }, [isMuted, onMuteToggle, onVolumeChange, prevVolume, volume]);

  const displayVolume = isMuted ? 0 : volume;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleMuteToggle}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isMuted || displayVolume === 0 ? (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : displayVolume < 0.5 ? (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </>
          ) : (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
            </>
          )}
        </svg>
      </button>
      <Slider
        value={displayVolume * 100}
        max={100}
        step={1}
        onValueChange={(v) => {
          const num = typeof v === "number" ? v : (v[0] ?? 0);
          onVolumeChange(num / 100);
        }}
        className="w-24"
      />
    </div>
  );
}
