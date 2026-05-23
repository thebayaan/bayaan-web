import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RecentSearchEntry {
  query: string;
  searchedAt: string;
}

interface RecentSearchesState {
  entries: RecentSearchEntry[];
  push: (query: string) => void;
  remove: (query: string) => void;
  clearAll: () => void;
}

const MAX_ENTRIES = 10;
const MIN_LENGTH = 2;

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      entries: [],
      push: (rawQuery) =>
        set((state) => {
          const query = rawQuery.trim();
          if (query.length < MIN_LENGTH) return state;
          // Case-insensitive dedupe, but preserve the user's original casing
          // by keeping whichever entry is newer.
          const lower = query.toLowerCase();
          const filtered = state.entries.filter((e) => e.query.toLowerCase() !== lower);
          const next: RecentSearchEntry = { query, searchedAt: new Date().toISOString() };
          return { entries: [next, ...filtered].slice(0, MAX_ENTRIES) };
        }),
      remove: (query) =>
        set((state) => {
          const lower = query.toLowerCase();
          return { entries: state.entries.filter((e) => e.query.toLowerCase() !== lower) };
        }),
      clearAll: () => set({ entries: [] }),
    }),
    {
      name: "bayaan-recent-searches",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
