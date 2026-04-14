import useSWR from "swr";
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

export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(
    "user/favorites",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { favorites: data?.data ?? [], isLoading, error, mutate };
}

export function useFavoriteReciters() {
  const { data, error, isLoading, mutate } = useSWR<FavoriteRecitersResponse>(
    "user/favorite-reciters",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { favoriteReciters: data?.data ?? [], isLoading, error, mutate };
}
