import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface PlaylistsResponse {
  data: Playlist[];
}

export function usePlaylists() {
  const { data, error, isLoading, mutate } = useSWR<PlaylistsResponse>(
    "user/playlists",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { playlists: data?.data ?? [], isLoading, error, mutate };
}
