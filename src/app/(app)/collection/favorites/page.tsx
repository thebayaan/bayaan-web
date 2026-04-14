"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { HeartIcon } from "@/components/icons";

export default function FavoritesPage() {
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-[var(--text-alpha-06)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <HeartIcon size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No favorites yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Heart a track while listening to add it here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--text-alpha-04)]"
            >
              <p className="text-sm">Surah {fav.surah_id}</p>
              <p className="text-xs text-muted-foreground">
                Reciter {fav.reciter_id.slice(0, 8)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
