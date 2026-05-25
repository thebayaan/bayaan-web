import useSWR from "swr";
import type { AyahTimestampsResponse } from "@/types/timestamps";
import { normalizeTimestampsPayload } from "@/lib/timestamp-fetch";

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function fetchAyahTimestamps(path: string): Promise<AyahTimestampsResponse> {
  const response = await fetch(`${BASE_URL}/api/timestamps/${path}`);
  if (!response.ok) {
    throw new Error(`Timestamps error: ${response.status}`);
  }
  return response.json().then((body: AyahTimestampsResponse) => ({
    data: {
      ...body.data,
      timestamps: normalizeTimestampsPayload(body.data.surah, body.data.timestamps),
    },
  }));
}

export function useAyahTimestamps(
  rewayatId: string | null,
  surah: number,
): {
  timestamps: AyahTimestampsResponse["data"]["timestamps"];
  isLoading: boolean;
  error: Error | undefined;
} {
  const key = rewayatId && surah > 0 && rewayatId.length > 0 ? `${rewayatId}/${surah}` : null;

  const { data, error, isLoading } = useSWR<AyahTimestampsResponse>(key, fetchAyahTimestamps, {
    revalidateOnFocus: false,
    dedupingInterval: 86400000,
  });

  return {
    timestamps: data?.data.timestamps ?? [],
    isLoading,
    error,
  };
}
