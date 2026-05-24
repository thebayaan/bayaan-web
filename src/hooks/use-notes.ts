import { useMemo } from "react";
import { useLibraryStore } from "@/stores/library-store";
import type { VerseNote } from "@/types/quran";

export function useNotes() {
  const notes = useLibraryStore((s) => s.notes);
  const upsertNoteStore = useLibraryStore((s) => s.upsertNote);
  const removeNoteStore = useLibraryStore((s) => s.removeNote);

  const byKey = useMemo(() => {
    const map = new Map<string, VerseNote>();
    for (const note of notes) map.set(note.verse_key, note);
    return map;
  }, [notes]);

  async function upsertNote(verseKey: string, content: string): Promise<void> {
    upsertNoteStore(verseKey, content);
  }

  async function removeNote(verseKey: string): Promise<void> {
    removeNoteStore(verseKey);
  }

  return {
    notes,
    byKey,
    isLoading: false,
    error: undefined,
    mutate: async () => undefined,
    upsertNote,
    removeNote,
  };
}
