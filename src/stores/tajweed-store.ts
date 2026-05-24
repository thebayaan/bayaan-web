import { create } from "zustand";
import {
  loadTajweedData,
  type IndexedTajweedData,
  type ProcessedTajweedWord,
} from "@/lib/tajweed-loader";

interface TajweedStore {
  indexedTajweedData: IndexedTajweedData | null;
  byLocation: Record<string, ProcessedTajweedWord> | null;
  isLoading: boolean;
  error: string | null;
  ensureLoaded: () => Promise<void>;
}

export const useTajweedStore = create<TajweedStore>((set, get) => ({
  indexedTajweedData: null,
  byLocation: null,
  isLoading: false,
  error: null,
  ensureLoaded: async () => {
    if (get().byLocation || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const { indexed, byLocation } = await loadTajweedData();
      set({
        indexedTajweedData: indexed,
        byLocation,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load tajweed data",
      });
    }
  },
}));
