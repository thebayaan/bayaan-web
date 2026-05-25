import { useLibraryStore, type Playlist } from "@/stores/library-store";

export type { Playlist };

interface CreateInput {
  name: string;
  description?: string;
}

interface UpdateInput {
  name?: string;
  description?: string;
}

export function usePlaylists() {
  const playlists = useLibraryStore((s) => s.playlists);
  const createPlaylistStore = useLibraryStore((s) => s.createPlaylist);
  const updatePlaylistStore = useLibraryStore((s) => s.updatePlaylist);
  const deletePlaylistStore = useLibraryStore((s) => s.deletePlaylist);

  async function createPlaylist(input: CreateInput): Promise<Playlist> {
    return createPlaylistStore(input);
  }

  async function updatePlaylist(id: string, input: UpdateInput): Promise<Playlist | null> {
    return updatePlaylistStore(id, input);
  }

  async function deletePlaylist(id: string): Promise<void> {
    deletePlaylistStore(id);
  }

  return {
    playlists,
    isLoading: false,
    error: undefined,
    mutate: async () => undefined,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
  };
}
