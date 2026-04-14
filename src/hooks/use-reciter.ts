import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { Reciter } from "@/types/reciter";

interface ReciterResponse {
  data: Reciter;
}

export function useReciter(slug: string) {
  const { data, error, isLoading } = useSWR<ReciterResponse>(
    slug ? `reciters/${slug}` : null,
    fetchBayaan,
    { revalidateOnFocus: false },
  );

  return { reciter: data?.data ?? null, isLoading, error };
}
