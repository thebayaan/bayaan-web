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

export interface FavoriteRef {
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
}

function favoriteKey(ref: FavoriteRef): string {
  return `${ref.reciter_id}/${ref.rewayat_id}/${ref.surah_id}`;
}

export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(FAVORITES_KEY, fetchBayaan, {
    revalidateOnFocus: false,
  });
  const favorites = useMemo(() => data?.data ?? [], [data]);

  const favoriteIds = useMemo(() => {
    const map = new Map<string, Favorite>();
    for (const fav of favorites) map.set(favoriteKey(fav), fav);
    return map;
  }, [favorites]);

  function isFavorite(ref: FavoriteRef): boolean {
    return favoriteIds.has(favoriteKey(ref));
  }

  async function addFavorite(ref: FavoriteRef): Promise<Favorite> {
    // Optimistic insert so the heart flips immediately. The server's real
    // id replaces this placeholder when mutate() revalidates below.
    const placeholder: Favorite = {
      id: `optimistic-${favoriteKey(ref)}`,
      reciter_id: ref.reciter_id,
      rewayat_id: ref.rewayat_id,
      surah_id: ref.surah_id,
      created_at: new Date().toISOString(),
    };
    await mutate((current) => ({ data: [...(current?.data ?? []), placeholder] }), {
      revalidate: false,
    });
    try {
      const response = await fetchBayaan<{ data: Favorite }>(FAVORITES_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ref),
      });
      await mutate();
      return response.data;
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  async function removeFavorite(ref: FavoriteRef): Promise<void> {
    const key = favoriteKey(ref);
    const target = favoriteIds.get(key);
    if (!target) return;
    // Optimistic update.
    await mutate(
      (current) => ({
        data: (current?.data ?? []).filter((f) => favoriteKey(f) !== key),
      }),
      { revalidate: false },
    );
    try {
      await fetchBayaan(`${FAVORITES_KEY}/${encodeURIComponent(target.id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  async function toggleFavorite(ref: FavoriteRef): Promise<void> {
    if (isFavorite(ref)) {
      await removeFavorite(ref);
    } else {
      await addFavorite(ref);
    }
  }

  return {
    favorites,
    isLoading,
    error,
    mutate,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
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
    // Optimistic insert so the heart flips immediately without waiting on
    // the network. The server's real id replaces this placeholder when the
    // mutate() call below revalidates.
    const placeholder: FavoriteReciter = {
      id: `optimistic-${reciterId}`,
      reciter_id: reciterId,
      created_at: new Date().toISOString(),
    };
    await mutate((current) => ({ data: [...(current?.data ?? []), placeholder] }), {
      revalidate: false,
    });
    try {
      const response = await fetchBayaan<{ data: FavoriteReciter }>(FAVORITE_RECITERS_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reciter_id: reciterId }),
      });
      await mutate();
      return response.data;
    } catch (err) {
      await mutate();
      throw err;
    }
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
