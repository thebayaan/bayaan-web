"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useReciters } from "@/hooks/use-reciters";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { usePlaylists } from "@/hooks/use-playlists";
import { ReciterCard } from "@/components/reciter-card";
import { ContinueWhereYouLeftOff } from "@/components/home/continue-where-you-left-off";
import { HomeSection } from "@/components/home/home-section";
import { getCategories, colorForCategory } from "@/data/adhkar-data";
import {
  getFeaturedReciters,
  getExclusives,
  getTajweedReciters,
  getMemorizationReciters,
  getBeginnerFriendlyReciters,
} from "@/data/reciter-collections";

const adhkarCategories = getCategories().slice(0, 12);

function useFavoriteRecitersData() {
  const { favoriteReciters } = useFavoriteReciters();
  const { reciters } = useReciters();
  return useMemo(() => {
    if (favoriteReciters.length === 0 || reciters.length === 0) return [];
    const favIds = new Set(favoriteReciters.map((f) => f.reciter_id));
    return reciters.filter((r) => favIds.has(r.id));
  }, [favoriteReciters, reciters]);
}

export default function HomePage() {
  const { reciters, isLoading } = useReciters();
  const favorites = useFavoriteRecitersData();
  const { playlists } = usePlaylists();

  const featured = useMemo(() => getFeaturedReciters(reciters), [reciters]);
  const exclusives = useMemo(() => getExclusives(reciters), [reciters]);
  const tajweed = useMemo(() => getTajweedReciters(reciters), [reciters]);
  const memorization = useMemo(() => getMemorizationReciters(reciters), [reciters]);
  const beginnerFriendly = useMemo(() => getBeginnerFriendlyReciters(reciters), [reciters]);
  const murattal = useMemo(
    () => reciters.filter((r) => r.rewayat.some((rw) => rw.style === "murattal")),
    [reciters],
  );
  const mojawwad = useMemo(
    () => reciters.filter((r) => r.rewayat.some((rw) => rw.style === "mojawwad")),
    [reciters],
  );

  // Unique rewayat types across all reciters
  const rewayatTypes = useMemo(() => {
    const seen = new Map<string, { name: string; style: string; count: number }>();
    for (const r of reciters) {
      for (const rw of r.rewayat) {
        const key = `${rw.name}-${rw.style}`;
        const existing = seen.get(key);
        if (existing) {
          existing.count++;
        } else {
          seen.set(key, { name: rw.name, style: rw.style, count: 1 });
        }
      }
    }
    return [...seen.values()].sort((a, b) => b.count - a.count);
  }, [reciters]);

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

      {/* 1. New to Quran? Start Here — beginner-friendly reciters */}
      {beginnerFriendly.length > 0 ? (
        <HomeSection title="New to Quran? Start Here">
          {beginnerFriendly.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 2. Your Favorites */}
      {favorites.length > 0 ? (
        <HomeSection title="Your Favorites" seeAllHref="/collection/favorites">
          {favorites.slice(0, 12).map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 3. Featured Reciters — Bayaan-curated spotlight */}
      {featured.length > 0 ? (
        <HomeSection title="Featured Reciters" seeAllHref="/search">
          {featured.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 4. Adhkar */}
      <HomeSection title="Adhkar" seeAllHref="/adhkar">
        {adhkarCategories.map((cat) => {
          const color = colorForCategory(cat);
          return (
            <Link
              key={cat.id}
              href={`/adhkar/${cat.id}`}
              className="flex h-[80px] w-[140px] shrink-0 flex-col justify-end rounded-xl border p-3 transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: color + "18", borderColor: color + "40" }}
            >
              <p className="line-clamp-2 text-[11px] leading-tight font-semibold">{cat.title}</p>
              <p className="text-muted-foreground text-[9px]">
                {cat.dhikrCount} {cat.dhikrCount === 1 ? "dhikr" : "adhkar"}
              </p>
            </Link>
          );
        })}
      </HomeSection>

      {/* 5. Your Playlists */}
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

      {/* 6. Exclusives — Bayaan Originals */}
      {exclusives.length > 0 ? (
        <HomeSection title="Exclusives">
          {exclusives.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 7. Best for Tajweed */}
      {tajweed.length > 0 ? (
        <HomeSection title="Best for Tajweed">
          {tajweed.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 8. Best for Memorization */}
      {memorization.length > 0 ? (
        <HomeSection title="Best for Memorization">
          {memorization.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 9. Explore by Rewayah */}
      {rewayatTypes.length > 0 ? (
        <HomeSection title="Explore by Rewayah">
          {rewayatTypes.slice(0, 10).map((rw) => (
            <div
              key={`${rw.name}-${rw.style}`}
              className="flex h-[90px] w-[130px] shrink-0 flex-col justify-end rounded-xl bg-[var(--text-alpha-06)] p-3"
            >
              <p className="text-[11px] font-semibold">{rw.name}</p>
              <p className="text-muted-foreground text-[9px] capitalize">
                {rw.style} · {rw.count} reciters
              </p>
            </div>
          ))}
        </HomeSection>
      ) : null}

      {/* 10. All Reciters */}
      <HomeSection title="All Reciters" seeAllHref="/search">
        {reciters.slice(0, 20).map((r) => (
          <ReciterCard key={r.id} reciter={r} />
        ))}
      </HomeSection>

      {/* 11. Murattal */}
      {murattal.length > 0 ? (
        <HomeSection title="Murattal">
          {murattal.slice(0, 15).map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 12. Mojawwad */}
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
