"use client";

import { Slider } from "@/components/ui/slider";
import { useCallback, useState } from "react";
import { formatTime } from "@/lib/format-time";

interface ProgressBarProps {
  positionMs: number;
  durationMs: number;
  onSeek: (positionMs: number) => void;
  compact?: boolean;
}

export function ProgressBar({ positionMs, durationMs, onSeek, compact }: ProgressBarProps) {
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
      <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
        <div
          className="bg-foreground/60 h-full transition-[width] duration-200"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <span className="text-muted-foreground w-14 text-right text-[10px] tabular-nums">
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
      <span className="text-muted-foreground w-14 text-[10px] tabular-nums">
        {formatTime(durationMs)}
      </span>
    </div>
  );
}
