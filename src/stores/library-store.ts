import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { VerseBookmark, VerseHighlight, VerseNote } from "@/types/quran";

export type HighlightColor = VerseHighlight["color"];

export interface TrackFavorite {
  id: string;
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
  created_at: string;
}

export interface FavoriteReciter {
  id: string;
  reciter_id: string;
  created_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
  position: number;
  created_at: string;
}

export interface CreateBookmarkInput {
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  note?: string;
}

export interface FavoriteRef {
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
}

export interface AddPlaylistItemInput {
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function timestamp(): string {
  return new Date().toISOString();
}

function favoriteKey(ref: FavoriteRef): string {
  return `${ref.reciter_id}/${ref.rewayat_id}/${ref.surah_id}`;
}

interface LibraryState {
  bookmarks: VerseBookmark[];
  highlights: VerseHighlight[];
  notes: VerseNote[];
  favorites: TrackFavorite[];
  favoriteReciters: FavoriteReciter[];
  playlists: Playlist[];
  playlistItems: PlaylistItem[];
  addBookmark: (input: CreateBookmarkInput) => VerseBookmark;
  removeBookmark: (verseKey: string) => void;
  setHighlight: (verseKey: string, color: HighlightColor) => void;
  removeHighlight: (verseKey: string) => void;
  upsertNote: (verseKey: string, content: string) => void;
  removeNote: (verseKey: string) => void;
  addFavorite: (ref: FavoriteRef) => TrackFavorite;
  removeFavorite: (ref: FavoriteRef) => void;
  addFavoriteReciter: (reciterId: string) => FavoriteReciter;
  removeFavoriteReciter: (reciterId: string) => void;
  createPlaylist: (input: { name: string; description?: string }) => Playlist;
  updatePlaylist: (id: string, input: { name?: string; description?: string }) => Playlist | null;
  deletePlaylist: (id: string) => void;
  addPlaylistItem: (playlistId: string, input: AddPlaylistItemInput) => PlaylistItem;
  removePlaylistItem: (playlistId: string, itemId: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      highlights: [],
      notes: [],
      favorites: [],
      favoriteReciters: [],
      playlists: [],
      playlistItems: [],

      addBookmark: (input) => {
        const bookmark: VerseBookmark = {
          id: newId("bookmark"),
          user_id: "local",
          verse_key: input.verse_key,
          surah_number: input.surah_number,
          ayah_number: input.ayah_number,
          note: input.note,
          created_at: timestamp(),
        };
        set((state) => ({
          bookmarks: [
            ...state.bookmarks.filter((entry) => entry.verse_key !== input.verse_key),
            bookmark,
          ],
        }));
        return bookmark;
      },

      removeBookmark: (verseKey) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((entry) => entry.verse_key !== verseKey),
        }));
      },

      setHighlight: (verseKey, color) => {
        const highlight: VerseHighlight = {
          id: newId("highlight"),
          user_id: "local",
          verse_key: verseKey,
          color,
          created_at: timestamp(),
        };
        set((state) => ({
          highlights: [
            ...state.highlights.filter((entry) => entry.verse_key !== verseKey),
            highlight,
          ],
        }));
      },

      removeHighlight: (verseKey) => {
        set((state) => ({
          highlights: state.highlights.filter((entry) => entry.verse_key !== verseKey),
        }));
      },

      upsertNote: (verseKey, content) => {
        const existing = get().notes.find((entry) => entry.verse_key === verseKey);
        const stamp = timestamp();
        if (existing) {
          set((state) => ({
            notes: state.notes.map((entry) =>
              entry.verse_key === verseKey ? { ...entry, content, updated_at: stamp } : entry,
            ),
          }));
          return;
        }
        const note: VerseNote = {
          id: newId("note"),
          user_id: "local",
          verse_key: verseKey,
          content,
          created_at: stamp,
          updated_at: stamp,
        };
        set((state) => ({ notes: [...state.notes, note] }));
      },

      removeNote: (verseKey) => {
        set((state) => ({
          notes: state.notes.filter((entry) => entry.verse_key !== verseKey),
        }));
      },

      addFavorite: (ref) => {
        const favorite: TrackFavorite = {
          id: newId("favorite"),
          reciter_id: ref.reciter_id,
          rewayat_id: ref.rewayat_id,
          surah_id: ref.surah_id,
          created_at: timestamp(),
        };
        set((state) => ({
          favorites: [
            ...state.favorites.filter((entry) => favoriteKey(entry) !== favoriteKey(ref)),
            favorite,
          ],
        }));
        return favorite;
      },

      removeFavorite: (ref) => {
        const key = favoriteKey(ref);
        set((state) => ({
          favorites: state.favorites.filter((entry) => favoriteKey(entry) !== key),
        }));
      },

      addFavoriteReciter: (reciterId) => {
        const favorite: FavoriteReciter = {
          id: newId("favorite-reciter"),
          reciter_id: reciterId,
          created_at: timestamp(),
        };
        set((state) => ({
          favoriteReciters: [
            ...state.favoriteReciters.filter((entry) => entry.reciter_id !== reciterId),
            favorite,
          ],
        }));
        return favorite;
      },

      removeFavoriteReciter: (reciterId) => {
        set((state) => ({
          favoriteReciters: state.favoriteReciters.filter(
            (entry) => entry.reciter_id !== reciterId,
          ),
        }));
      },

      createPlaylist: (input) => {
        const stamp = timestamp();
        const playlist: Playlist = {
          id: newId("playlist"),
          name: input.name,
          description: input.description,
          is_public: false,
          created_at: stamp,
          updated_at: stamp,
        };
        set((state) => ({ playlists: [...state.playlists, playlist] }));
        return playlist;
      },

      updatePlaylist: (id, input) => {
        let updated: Playlist | null = null;
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== id) return playlist;
            updated = {
              ...playlist,
              ...input,
              updated_at: timestamp(),
            };
            return updated;
          }),
        }));
        return updated;
      },

      deletePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter((playlist) => playlist.id !== id),
          playlistItems: state.playlistItems.filter((item) => item.playlist_id !== id),
        }));
      },

      addPlaylistItem: (playlistId, input) => {
        const items = get().playlistItems.filter((item) => item.playlist_id === playlistId);
        const item: PlaylistItem = {
          id: newId("playlist-item"),
          playlist_id: playlistId,
          reciter_id: input.reciter_id,
          rewayat_id: input.rewayat_id,
          surah_id: input.surah_id,
          position: items.length,
          created_at: timestamp(),
        };
        set((state) => ({
          playlistItems: [...state.playlistItems, item],
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId ? { ...playlist, updated_at: timestamp() } : playlist,
          ),
        }));
        return item;
      },

      removePlaylistItem: (playlistId, itemId) => {
        set((state) => ({
          playlistItems: state.playlistItems.filter((item) => item.id !== itemId),
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId ? { ...playlist, updated_at: timestamp() } : playlist,
          ),
        }));
      },
    }),
    {
      name: "bayaan-library",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
