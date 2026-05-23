import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RecentlyPlayedEntry {
  reciterId: string;
  rewayatId: string;
  surahId: number;
  /** Cached display fields so we can render the card before the reciter list
   * has hydrated from the network. */
  reciterName: string;
  surahName: string;
  artwork: string | null;
  playedAt: string;
}

interface RecentlyPlayedState {
  entries: RecentlyPlayedEntry[];
  push: (entry: Omit<RecentlyPlayedEntry, "playedAt">) => void;
  clear: () => void;
}

const MAX_ENTRIES = 20;

function trackKey(e: Pick<RecentlyPlayedEntry, "reciterId" | "rewayatId" | "surahId">): string {
  return `${e.reciterId}/${e.rewayatId}/${e.surahId}`;
}

export const useRecentlyPlayedStore = create<RecentlyPlayedState>()(
  persist(
    (set) => ({
      entries: [],
      push: (entry) =>
        set((state) => {
          const key = trackKey(entry);
          const filtered = state.entries.filter((e) => trackKey(e) !== key);
          const next: RecentlyPlayedEntry = { ...entry, playedAt: new Date().toISOString() };
          return { entries: [next, ...filtered].slice(0, MAX_ENTRIES) };
        }),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "bayaan-recently-played",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
