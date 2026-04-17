import { create } from "zustand";

interface VerseSelectionState {
  selectedVerseKey: string | null;
  select: (verseKey: string) => void;
  clear: () => void;
  toggle: (verseKey: string) => void;
}

export const useVerseSelectionStore = create<VerseSelectionState>((set) => ({
  selectedVerseKey: null,
  select: (verseKey) => set({ selectedVerseKey: verseKey }),
  clear: () => set({ selectedVerseKey: null }),
  toggle: (verseKey) =>
    set((s) => ({
      selectedVerseKey: s.selectedVerseKey === verseKey ? null : verseKey,
    })),
}));
