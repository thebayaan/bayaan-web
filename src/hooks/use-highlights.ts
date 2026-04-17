import useSWR from "swr";
import { useMemo } from "react";
import { fetchBayaan } from "@/lib/api";
import type { VerseHighlight } from "@/types/quran";

export type HighlightColor = VerseHighlight["color"];

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

interface HighlightsResponse {
  data: VerseHighlight[];
}

const KEY = "user/highlights";

export function useHighlights() {
  const { data, error, isLoading, mutate } = useSWR<HighlightsResponse>(KEY, fetchBayaan, {
    revalidateOnFocus: false,
  });
  const highlights = data?.data ?? [];

  const byKey = useMemo(() => {
    const map = new Map<string, VerseHighlight>();
    for (const h of highlights) map.set(h.verse_key, h);
    return map;
  }, [highlights]);

  function getHighlight(verseKey: string): VerseHighlight | undefined {
    return byKey.get(verseKey);
  }

  async function setHighlight(verseKey: string, color: HighlightColor): Promise<void> {
    await mutate(
      (current) => {
        const next = (current?.data ?? []).filter((h) => h.verse_key !== verseKey);
        next.push({
          id: `temp-${verseKey}`,
          user_id: "",
          verse_key: verseKey,
          color,
          created_at: new Date().toISOString(),
        });
        return { data: next };
      },
      { revalidate: false },
    );
    try {
      await fetchBayaan(KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse_key: verseKey, color }),
      });
    } catch (err) {
      await mutate();
      throw err;
    }
    await mutate();
  }

  async function removeHighlight(verseKey: string): Promise<void> {
    await mutate(
      (current) => ({ data: (current?.data ?? []).filter((h) => h.verse_key !== verseKey) }),
      { revalidate: false },
    );
    try {
      await fetchBayaan(`${KEY}/${encodeURIComponent(verseKey)}`, { method: "DELETE" });
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  return {
    highlights,
    byKey,
    isLoading,
    error,
    getHighlight,
    setHighlight,
    removeHighlight,
  };
}
