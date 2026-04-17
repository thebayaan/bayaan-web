import { create } from "zustand";

export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface VerseSelectionState {
  selectedVerseKey: string | null;
  anchorRect: AnchorRect | null;
  select: (verseKey: string, rect: AnchorRect) => void;
  clear: () => void;
  toggle: (verseKey: string, rect: AnchorRect) => void;
}

export const useVerseSelectionStore = create<VerseSelectionState>((set) => ({
  selectedVerseKey: null,
  anchorRect: null,
  select: (verseKey, rect) => set({ selectedVerseKey: verseKey, anchorRect: rect }),
  clear: () => set({ selectedVerseKey: null, anchorRect: null }),
  toggle: (verseKey, rect) =>
    set((s) => ({
      selectedVerseKey: s.selectedVerseKey === verseKey ? null : verseKey,
      anchorRect: s.selectedVerseKey === verseKey ? null : rect,
    })),
}));
