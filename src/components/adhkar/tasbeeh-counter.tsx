"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDhikrCountsStore } from "@/stores/dhikr-counts-store";

interface TasbeehCounterProps {
  dhikrId: string;
  target: number;
}

export function TasbeehCounter({ dhikrId, target }: TasbeehCounterProps) {
  const count = useDhikrCountsStore((s) => s.counts[dhikrId] ?? 0);
  const increment = useDhikrCountsStore((s) => s.increment);
  const reset = useDhikrCountsStore((s) => s.reset);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const progress = target > 0 ? Math.min(count / target, 1) : 0;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - progress * circumference;
  const isComplete = count >= target;

  const handleIncrement = useCallback(() => {
    increment(dhikrId);
  }, [dhikrId, increment]);

  useEffect(() => {
    buttonRef.current?.focus();
  }, [dhikrId]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        ref={buttonRef}
        onClick={handleIncrement}
        aria-label={`Tasbeeh counter, ${count} of ${target}. Press to count.`}
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={target}
        role="spinbutton"
        className={`group relative flex h-40 w-40 items-center justify-center rounded-full transition-transform outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 ${
          isComplete ? "text-emerald-500" : "text-foreground"
        }`}
      >
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="var(--text-alpha-06)"
            strokeWidth="4"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums">{count}</p>
          <p className="text-muted-foreground text-xs">/ {target}</p>
        </div>
      </button>
      <button
        onClick={() => reset(dhikrId)}
        className="rounded-lg bg-[var(--text-alpha-06)] px-4 py-2 text-sm transition-colors hover:bg-[var(--text-alpha-10)]"
      >
        Reset
      </button>
      <p className="text-muted-foreground text-xs">Press Space or Enter to count</p>
    </div>
  );
}
