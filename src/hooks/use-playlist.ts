import { useLibraryStore, type AddPlaylistItemInput, type PlaylistItem } from "@/stores/library-store";
import type { Playlist } from "./use-playlists";

export type { AddPlaylistItemInput, PlaylistItem };

export async function addPlaylistItem(
  playlistId: string,
  input: AddPlaylistItemInput,
): Promise<PlaylistItem> {
  return useLibraryStore.getState().addPlaylistItem(playlistId, input);
}

export async function removePlaylistItem(playlistId: string, itemId: string): Promise<void> {
  useLibraryStore.getState().removePlaylistItem(playlistId, itemId);
}

export function usePlaylist(id: string | null) {
  const playlists = useLibraryStore((s) => s.playlists);
  const playlistItems = useLibraryStore((s) => s.playlistItems);

  const playlist = id ? (playlists.find((entry) => entry.id === id) ?? null) : null;
  const items = id ? playlistItems.filter((item) => item.playlist_id === id) : [];

  return {
    playlist: playlist as Playlist | undefined,
    items,
    isLoading: false,
    error: undefined,
    mutate: async () => undefined,
  };
}
