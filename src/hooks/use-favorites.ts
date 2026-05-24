import { useMemo } from "react";
import {
  useLibraryStore,
  type FavoriteRef,
  type TrackFavorite,
  type FavoriteReciter,
} from "@/stores/library-store";

export type { FavoriteRef };

function favoriteKey(ref: FavoriteRef): string {
  return `${ref.reciter_id}/${ref.rewayat_id}/${ref.surah_id}`;
}

export function useFavorites() {
  const favorites = useLibraryStore((s) => s.favorites);
  const addFavorite = useLibraryStore((s) => s.addFavorite);
  const removeFavorite = useLibraryStore((s) => s.removeFavorite);

  const favoriteIds = useMemo(() => {
    const map = new Map<string, TrackFavorite>();
    for (const favorite of favorites) map.set(favoriteKey(favorite), favorite);
    return map;
  }, [favorites]);

  function isFavorite(ref: FavoriteRef): boolean {
    return favoriteIds.has(favoriteKey(ref));
  }

  async function toggleFavorite(ref: FavoriteRef): Promise<void> {
    if (isFavorite(ref)) {
      removeFavorite(ref);
      return;
    }
    addFavorite(ref);
  }

  return {
    favorites,
    isLoading: false,
    error: undefined,
    mutate: async () => undefined,
    isFavorite,
    addFavorite: async (ref: FavoriteRef) => addFavorite(ref),
    removeFavorite: async (ref: FavoriteRef) => removeFavorite(ref),
    toggleFavorite,
  };
}

export function useFavoriteReciters() {
  const favoriteReciters = useLibraryStore((s) => s.favoriteReciters);
  const addFavoriteReciter = useLibraryStore((s) => s.addFavoriteReciter);
  const removeFavoriteReciter = useLibraryStore((s) => s.removeFavoriteReciter);

  const favoritedIds = useMemo(
    () => new Set(favoriteReciters.map((favorite) => favorite.reciter_id)),
    [favoriteReciters],
  );

  function isFavoriteReciter(reciterId: string): boolean {
    return favoritedIds.has(reciterId);
  }

  async function toggleFavoriteReciter(reciterId: string): Promise<void> {
    if (favoritedIds.has(reciterId)) {
      removeFavoriteReciter(reciterId);
      return;
    }
    addFavoriteReciter(reciterId);
  }

  return {
    favoriteReciters,
    favoritedIds,
    isFavoriteReciter,
    isLoading: false,
    error: undefined,
    mutate: async () => undefined,
    addFavoriteReciter: async (reciterId: string) => addFavoriteReciter(reciterId),
    removeFavoriteReciter: async (reciterId: string) => removeFavoriteReciter(reciterId),
    toggleFavoriteReciter,
  };
}
