"use client";

import { useEffect } from "react";
import { setContinueReading } from "./use-continue-reading";
import type { Surah } from "@/types/quran";

export function useReadingProgress(surah: Surah, verseId?: number): void {
  useEffect(() => {
    setContinueReading({
      surahId: surah.id,
      surahName: surah.name,
      verseId: verseId ?? 1,
      page: surah.id,
    });
  }, [surah.id, surah.name, verseId]);
}
