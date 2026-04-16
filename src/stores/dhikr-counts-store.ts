import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DhikrCountsState {
  counts: Record<string, number>;
  increment: (dhikrId: string) => void;
  reset: (dhikrId: string) => void;
  resetAll: () => void;
}

export const useDhikrCountsStore = create<DhikrCountsState>()(
  persist(
    (set) => ({
      counts: {},
      increment: (dhikrId) =>
        set((state) => ({
          counts: { ...state.counts, [dhikrId]: (state.counts[dhikrId] ?? 0) + 1 },
        })),
      reset: (dhikrId) =>
        set((state) => {
          const next = { ...state.counts };
          delete next[dhikrId];
          return { counts: next };
        }),
      resetAll: () => set({ counts: {} }),
    }),
    {
      name: "bayaan-dhikr-counts",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
