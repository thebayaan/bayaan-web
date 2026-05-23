import useSWR from "swr";
import { useMemo } from "react";
import { fetchBayaan } from "@/lib/api";

interface Favorite {
  id: string;
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
  created_at: string;
}

interface FavoritesResponse {
  data: Favorite[];
}

interface FavoriteReciter {
  id: string;
  reciter_id: string;
  created_at: string;
}

interface FavoriteRecitersResponse {
  data: FavoriteReciter[];
}

const FAVORITES_KEY = "user/favorites";
const FAVORITE_RECITERS_KEY = "user/favorite-reciters";

export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(FAVORITES_KEY, fetchBayaan, {
    revalidateOnFocus: false,
  });
  return { favorites: data?.data ?? [], isLoading, error, mutate };
}

export function useFavoriteReciters() {
  const { data, error, isLoading, mutate } = useSWR<FavoriteRecitersResponse>(
    FAVORITE_RECITERS_KEY,
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  const favoriteReciters = useMemo(() => data?.data ?? [], [data]);

  const favoritedIds = useMemo(
    () => new Set(favoriteReciters.map((f) => f.reciter_id)),
    [favoriteReciters],
  );

  function isFavoriteReciter(reciterId: string): boolean {
    return favoritedIds.has(reciterId);
  }

  async function addFavoriteReciter(reciterId: string): Promise<FavoriteReciter> {
    const response = await fetchBayaan<{ data: FavoriteReciter }>(FAVORITE_RECITERS_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reciter_id: reciterId }),
    });
    await mutate();
    return response.data;
  }

  async function removeFavoriteReciter(reciterId: string): Promise<void> {
    // Optimistic update: drop locally first, roll back on failure.
    await mutate(
      (current) => ({
        data: (current?.data ?? []).filter((f) => f.reciter_id !== reciterId),
      }),
      { revalidate: false },
    );
    try {
      await fetchBayaan(`${FAVORITE_RECITERS_KEY}/${encodeURIComponent(reciterId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  async function toggleFavoriteReciter(reciterId: string): Promise<void> {
    if (favoritedIds.has(reciterId)) {
      await removeFavoriteReciter(reciterId);
    } else {
      await addFavoriteReciter(reciterId);
    }
  }

  return {
    favoriteReciters,
    favoritedIds,
    isFavoriteReciter,
    isLoading,
    error,
    mutate,
    addFavoriteReciter,
    removeFavoriteReciter,
    toggleFavoriteReciter,
  };
}
