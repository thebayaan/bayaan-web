"use client";

import { Slider } from "@/components/ui/slider";
import { useCallback, useState } from "react";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface ProgressBarProps {
  positionMs: number;
  durationMs: number;
  onSeek: (positionMs: number) => void;
  compact?: boolean;
}

export function ProgressBar({
  positionMs,
  durationMs,
  onSeek,
  compact,
}: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;
  const displayProgress = isDragging ? dragValue : progress;

  const handleValueChange = useCallback((value: number | readonly number[]) => {
    const v = typeof value === "number" ? value : (value[0] ?? 0);
    setDragValue(v);
    setIsDragging(true);
  }, []);

  const handleValueCommitted = useCallback(
    (value: number | readonly number[]) => {
      const v = typeof value === "number" ? value : (value[0] ?? 0);
      const seekMs = (v / 100) * durationMs;
      onSeek(seekMs);
      setIsDragging(false);
    },
    [durationMs, onSeek],
  );

  if (compact) {
    return (
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground/60 transition-[width] duration-200"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[10px] text-muted-foreground w-10 text-right tabular-nums">
        {formatTime(isDragging ? (dragValue / 100) * durationMs : positionMs)}
      </span>
      <Slider
        value={displayProgress}
        max={100}
        step={0.1}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        className="flex-1"
      />
      <span className="text-[10px] text-muted-foreground w-10 tabular-nums">
        {formatTime(durationMs)}
      </span>
    </div>
  );
}
