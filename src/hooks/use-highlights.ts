import { useMemo } from "react";
import { useLibraryStore, type HighlightColor } from "@/stores/library-store";
import type { VerseHighlight } from "@/types/quran";

export type { HighlightColor };

export const HIGHLIGHT_COLORS: ReadonlyArray<HighlightColor> = [
  "yellow",
  "green",
  "blue",
  "pink",
  "purple",
];

export const HIGHLIGHT_SWATCH: Record<HighlightColor, string> = {
  yellow: "#fcd34d",
  green: "#6ee7b7",
  blue: "#93c5fd",
  pink: "#f9a8d4",
  purple: "#c4b5fd",
};

export function useHighlights() {
  const highlights = useLibraryStore((s) => s.highlights);
  const setHighlightStore = useLibraryStore((s) => s.setHighlight);
  const removeHighlightStore = useLibraryStore((s) => s.removeHighlight);

  const byKey = useMemo(() => {
    const map = new Map<string, VerseHighlight>();
    for (const highlight of highlights) map.set(highlight.verse_key, highlight);
    return map;
  }, [highlights]);

  function getHighlight(verseKey: string): VerseHighlight | undefined {
    return byKey.get(verseKey);
  }

  async function setHighlight(verseKey: string, color: HighlightColor): Promise<void> {
    setHighlightStore(verseKey, color);
  }

  async function removeHighlight(verseKey: string): Promise<void> {
    removeHighlightStore(verseKey);
  }

  return {
    highlights,
    byKey,
    isLoading: false,
    error: undefined,
    getHighlight,
    setHighlight,
    removeHighlight,
  };
}
