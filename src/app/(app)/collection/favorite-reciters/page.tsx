"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { useReciters } from "@/hooks/use-reciters";
import { ReciterCard } from "@/components/reciter-card";
import { HeartIcon } from "@/components/icons";

export default function FavoriteRecitersPage() {
  const {
    favoriteReciters,
    isLoading: isLoadingFavorites,
    error: favoritesError,
  } = useFavoriteReciters();
  const { reciters, isLoading: isLoadingReciters, error: recitersError } = useReciters();
  const isLoading = isLoadingFavorites || isLoadingReciters;
  const error = favoritesError ?? recitersError;

  const favoritedReciters = useMemo(() => {
    if (favoriteReciters.length === 0 || reciters.length === 0) return [];
    const order = new Map(favoriteReciters.map((f, i) => [f.reciter_id, i]));
    return reciters
      .filter((r) => order.has(r.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [favoriteReciters, reciters]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Favorite Reciters</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-sunken aspect-square animate-pulse rounded-md" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="py-12 text-center">
          <p className="text-foreground font-medium">We couldn&apos;t load your favorites.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {error instanceof Error ? error.message : "Try refreshing in a moment."}
          </p>
        </div>
      ) : favoritedReciters.length === 0 ? (
        <div className="py-12 text-center">
          <HeartIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No favorite reciters yet</p>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Heart a reciter to save them here for quick access.
          </p>
          <Link
            href="/quran"
            className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Browse reciters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {favoritedReciters.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </div>
      )}
    </div>
  );
}
