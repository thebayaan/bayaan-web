import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { Reciter } from "@/types/reciter";

interface RecitersResponse {
  data: Reciter[];
  pagination: { page: number; limit: number; total: number };
}

export function useReciters() {
  const { data, error, isLoading } = useSWR<RecitersResponse>(
    "reciters?page=1&limit=200",
    fetchBayaan,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const reciters = data?.data ?? [];
  const featured = reciters.filter((r) => r.is_featured);

  return { reciters, featured, isLoading, error };
}
