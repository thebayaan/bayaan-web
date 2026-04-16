"use client";

import type { Surah } from "@/types/quran";
import { useReadingProgress } from "@/hooks/use-reading-progress";

interface Props {
  surah: Surah;
  verseId?: number;
}

export function ReadingProgressTracker({ surah, verseId }: Props): null {
  useReadingProgress(surah, verseId);
  return null;
}
