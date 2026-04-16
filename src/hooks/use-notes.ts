import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { VerseNote } from "@/types/quran";

interface NotesResponse {
  data: VerseNote[];
}

export function useNotes() {
  const { data, error, isLoading, mutate } = useSWR<NotesResponse>("user/notes", fetchBayaan, {
    revalidateOnFocus: false,
  });
  return { notes: data?.data ?? [], isLoading, error, mutate };
}
