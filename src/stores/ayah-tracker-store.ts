import { create } from "zustand";
import type { AyahTimestamp } from "@/types/timestamps";

interface AyahTrackerState {
  /** Rewayat + surah the loaded timestamps belong to, e.g. "rw-id:1". */
  cacheKey: string | null;
  timestamps: AyahTimestamp[];
  activeVerseKey: string | null;
  /** Surah id of the currently tracked track (for scoping highlights). */
  trackedSurahId: number | null;
  setTimestamps: (cacheKey: string, surahId: number, timestamps: AyahTimestamp[]) => void;
  setActiveVerseKey: (verseKey: string | null) => void;
  clear: () => void;
}

export const useAyahTrackerStore = create<AyahTrackerState>((set) => ({
  cacheKey: null,
  timestamps: [],
  activeVerseKey: null,
  trackedSurahId: null,

  setTimestamps: (cacheKey, surahId, timestamps) =>
    set({
      cacheKey,
      trackedSurahId: surahId,
      timestamps,
      activeVerseKey: null,
    }),

  setActiveVerseKey: (verseKey) => set({ activeVerseKey: verseKey }),

  clear: () =>
    set({
      cacheKey: null,
      timestamps: [],
      activeVerseKey: null,
      trackedSurahId: null,
    }),
}));
