"use client";

import Link from "next/link";
import { useReciters } from "@/hooks/use-reciters";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { usePlaylists } from "@/hooks/use-playlists";
import { ReciterCard } from "@/components/reciter-card";
import { ContinueWhereYouLeftOff } from "@/components/home/continue-where-you-left-off";
import { HomeSection } from "@/components/home/home-section";
import { getCategories, colorForCategory } from "@/data/adhkar-data";

const adhkarCategories = getCategories().slice(0, 12);

function useFavoriteRecitersData() {
  const { favoriteReciters } = useFavoriteReciters();
  const { reciters } = useReciters();
  if (favoriteReciters.length === 0 || reciters.length === 0) return [];
  const favIds = new Set(favoriteReciters.map((f) => f.reciter_id));
  return reciters.filter((r) => favIds.has(r.id));
}

export default function HomePage() {
  const { reciters, featured, isLoading } = useReciters();
  const favorites = useFavoriteRecitersData();
  const { playlists } = usePlaylists();

  const murattal = reciters.filter((r) => r.rewayat.some((rw) => rw.style === "murattal"));
  const mojawwad = reciters.filter((r) => r.rewayat.some((rw) => rw.style === "mojawwad"));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-36 rounded bg-[var(--text-alpha-06)]" />
          <div className="flex gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 space-y-2">
                <div className="h-[120px] w-[120px] rounded-lg bg-[var(--text-alpha-06)]" />
                <div className="h-3 w-20 rounded bg-[var(--text-alpha-06)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="px-6">
        <ContinueWhereYouLeftOff />
      </div>

      {favorites.length > 0 ? (
        <HomeSection title="Your Favorites" seeAllHref="/collection/favorites">
          {favorites.slice(0, 12).map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      <HomeSection title="Featured Reciters" seeAllHref="/search">
        {featured.map((r) => (
          <ReciterCard key={r.id} reciter={r} />
        ))}
      </HomeSection>

      <HomeSection title="Adhkar">
        {adhkarCategories.map((cat) => {
          const color = colorForCategory(cat);
          return (
            <Link
              key={cat.id}
              href={`/adhkar/${cat.id}`}
              className="flex h-[80px] w-[140px] shrink-0 flex-col justify-end rounded-xl p-3 transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: color + "30", borderColor: color + "50" }}
            >
              <p className="line-clamp-2 text-[11px] leading-tight font-semibold">{cat.title}</p>
              <p className="text-muted-foreground text-[9px]">
                {cat.dhikrCount} {cat.dhikrCount === 1 ? "dhikr" : "adhkar"}
              </p>
            </Link>
          );
        })}
      </HomeSection>

      {playlists.length > 0 ? (
        <HomeSection title="Your Playlists" seeAllHref="/collection/playlists">
          {playlists.slice(0, 8).map((pl) => (
            <Link
              key={pl.id}
              href={`/collection/playlists/${pl.id}`}
              className="flex h-[100px] w-[100px] shrink-0 flex-col justify-end rounded-xl bg-[var(--text-alpha-06)] p-3 transition-colors hover:bg-[var(--text-alpha-10)]"
            >
              <p className="line-clamp-2 text-[11px] leading-tight font-semibold">{pl.name}</p>
            </Link>
          ))}
        </HomeSection>
      ) : null}

      <HomeSection title="All Reciters" seeAllHref="/search">
        {reciters.slice(0, 20).map((r) => (
          <ReciterCard key={r.id} reciter={r} />
        ))}
      </HomeSection>

      <HomeSection title="Murattal">
        {murattal.slice(0, 15).map((r) => (
          <ReciterCard key={r.id} reciter={r} />
        ))}
      </HomeSection>

      {mojawwad.length > 0 ? (
        <HomeSection title="Mojawwad">
          {mojawwad.slice(0, 15).map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}
    </div>
  );
}
