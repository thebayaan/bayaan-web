import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { Playlist } from "./use-playlists";

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
  position: number;
  created_at: string;
}

interface PlaylistResponse {
  data: {
    playlist: Playlist;
    items: PlaylistItem[];
  };
}

export function usePlaylist(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PlaylistResponse>(
    id ? `user/playlists/${id}` : null,
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return {
    playlist: data?.data.playlist,
    items: data?.data.items ?? [],
    isLoading,
    error,
    mutate,
  };
}
