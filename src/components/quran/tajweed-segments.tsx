"use client";

import type { TajweedSegment } from "@/lib/tajweed-loader";
import { tajweedColors } from "@/constants/tajweed-colors";
import { cn } from "@/lib/utils";

interface TajweedSegmentsProps {
  segments: TajweedSegment[];
  showTajweed: boolean;
  defaultColor?: string;
  className?: string;
}

export function TajweedSegments({
  segments,
  showTajweed,
  defaultColor,
  className,
}: TajweedSegmentsProps) {
  return (
    <span className={cn("inline", className)}>
      {segments.map((segment, index) => {
        const color =
          showTajweed && segment.rule
            ? (tajweedColors[segment.rule] ?? defaultColor)
            : defaultColor;
        return (
          <span key={index} style={color ? { color } : undefined}>
            {segment.text}
          </span>
        );
      })}
    </span>
  );
}
