import useSWR from "swr";
import { useMemo } from "react";
import { fetchBayaan } from "@/lib/api";
import type { VerseNote } from "@/types/quran";

interface NotesResponse {
  data: VerseNote[];
}

const KEY = "user/notes";

export function useNotes() {
  const { data, error, isLoading, mutate } = useSWR<NotesResponse>(KEY, fetchBayaan, {
    revalidateOnFocus: false,
  });
  const notes = data?.data ?? [];

  const byKey = useMemo(() => {
    const map = new Map<string, VerseNote>();
    for (const n of notes) map.set(n.verse_key, n);
    return map;
  }, [notes]);

  async function upsertNote(verseKey: string, content: string): Promise<void> {
    const existing = byKey.get(verseKey);
    if (existing) {
      await fetchBayaan(`${KEY}/${encodeURIComponent(verseKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } else {
      await fetchBayaan(KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse_key: verseKey, content }),
      });
    }
    await mutate();
  }

  async function removeNote(verseKey: string): Promise<void> {
    await mutate(
      (current) => ({ data: (current?.data ?? []).filter((n) => n.verse_key !== verseKey) }),
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
    notes,
    byKey,
    isLoading,
    error,
    mutate,
    upsertNote,
    removeNote,
  };
}
