import useSWR, { mutate as globalMutate } from "swr";
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

export interface AddPlaylistItemInput {
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
}

export async function addPlaylistItem(
  playlistId: string,
  input: AddPlaylistItemInput,
): Promise<PlaylistItem> {
  const response = await fetchBayaan<{ data: PlaylistItem }>(`user/playlists/${playlistId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await globalMutate(`user/playlists/${playlistId}`);
  await globalMutate("user/playlists");
  return response.data;
}

export async function removePlaylistItem(playlistId: string, itemId: string): Promise<void> {
  await fetchBayaan(`user/playlists/${playlistId}/items/${itemId}`, {
    method: "DELETE",
  });
  await globalMutate(`user/playlists/${playlistId}`);
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
