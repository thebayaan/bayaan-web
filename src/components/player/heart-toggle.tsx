"use client";

import { useFavorites, type FavoriteRef } from "@/hooks/use-favorites";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { HeartIcon } from "@/components/icons";

interface HeartToggleProps {
  target: FavoriteRef;
  trackTitle: string;
  className?: string;
}

export function HeartToggle({ target, trackTitle, className }: HeartToggleProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const gate = useAuthGate();
  const favorited = isFavorite(target);

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={
        favorited ? `Remove ${trackTitle} from favorites` : `Save ${trackTitle} to favorites`
      }
      onClick={gate(() => {
        void toggleFavorite(target);
      })}
      className={
        className ??
        `duration-fast ease-standard rounded-full p-1.5 transition-colors ${
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
