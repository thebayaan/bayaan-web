"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/use-favorites";
import { HeartIcon } from "@/components/icons";

export default function FavoritesPage() {
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Favorites</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-sunken h-16 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-12 text-center">
          <HeartIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No favorites yet</p>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Heart a track while listening to add it here.
          </p>
          <Link
            href="/quran"
            className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Browse surahs
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-surface-raised flex items-center gap-3 rounded-lg p-3">
              <p className="text-sm">Surah {fav.surah_id}</p>
              <p className="text-muted-foreground text-xs">
                Reciter {fav.reciter_id.slice(0, 8)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
