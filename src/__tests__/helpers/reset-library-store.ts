import { useLibraryStore } from "@/stores/library-store";

export function resetLibraryStore(): void {
  useLibraryStore.setState({
    bookmarks: [],
    highlights: [],
    notes: [],
    favorites: [],
    favoriteReciters: [],
    playlists: [],
    playlistItems: [],
  });
}
