"use client";

import { useState } from "react";
import { useFavorites, type FavoriteRef } from "@/hooks/use-favorites";
import { HeartIcon } from "@/components/icons";

interface HeartToggleProps {
  target: FavoriteRef;
  trackTitle: string;
  className?: string;
}

export function HeartToggle({ target, trackTitle, className }: HeartToggleProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(target);
  // In-flight guard prevents a second click from firing a duplicate POST
  // while the first request is still in transit. SWR cache only updates
  // after the round-trip, so without this guard double-tap creates two
  // favorite rows.
  const [pending, setPending] = useState(false);

  async function handleClick(): Promise<void> {
    if (pending) return;
    setPending(true);
    try {
      await toggleFavorite(target);
    } catch {
      // toggleFavorite already restores SWR cache on failure. Swallow here
      // so the click handler doesn't surface as an unhandled rejection.
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-busy={pending}
      disabled={pending}
      aria-label={
        favorited ? `Remove ${trackTitle} from favorites` : `Save ${trackTitle} to favorites`
      }
      onClick={() => {
        void handleClick();
      }}
      className={
        className ??
        `duration-fast ease-standard rounded-full p-1.5 transition-colors disabled:opacity-60 ${
          favorited
            ? "text-brand-main hover:bg-brand-light"
            : "text-muted-foreground hover:text-foreground hover:bg-[var(--text-alpha-10)]"
        }`
      }
    >
      <HeartIcon size={16} color="currentColor" filled={favorited} />
    </button>
  );
}
