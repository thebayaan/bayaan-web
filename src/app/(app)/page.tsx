"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useReciters } from "@/hooks/use-reciters";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { usePlaylists } from "@/hooks/use-playlists";
import { ReciterCard } from "@/components/reciter-card";
import { ContinueWhereYouLeftOff } from "@/components/home/continue-where-you-left-off";
import { HomeSection } from "@/components/home/home-section";
import { RecentlyPlayedSection } from "@/components/home/recently-played-section";
import {
  getFeaturedReciters,
  getExclusives,
  getTajweedReciters,
  getMemorizationReciters,
  getBeginnerFriendlyReciters,
} from "@/data/reciter-collections";
import { MAIN_ADHKAR, OTHER_ADHKAR } from "@/data/adhkar-super-categories";
import { getRewayatByTeacher } from "@/data/rewayat-registry";

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
  // removed: murattal, mojawwad, rewayatTypes (per user request)

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="py-4 sm:py-6">
      <ContinueWhereYouLeftOff />

      <RecentlyPlayedSection />

      {/* 1. Your Favorites */}
      {favorites.length > 0 ? (
        <HomeSection title="Your Favorites" seeAllHref="/collection/favorites">
          {favorites.slice(0, 12).map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 3. Featured Reciters — Bayaan-curated spotlight */}
      {featured.length > 0 ? (
        <HomeSection title="Featured Reciters" seeAllHref="/search/collection/featured">
          {featured.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 4. Adhkar — theme-aware CDN images, text outside card */}
      <HomeSection title="Adhkar" seeAllHref="/adhkar">
        {[...MAIN_ADHKAR, ...OTHER_ADHKAR.slice(0, 5)].map((cat) => (
          <Link
            key={cat.id}
            href={`/adhkar/${cat.id}`}
            className="block w-full transition-transform hover:scale-[1.02]"
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageLight}
                alt=""
                className="absolute inset-0 h-full w-full object-cover dark:hidden"
                loading="lazy"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageDark}
                alt=""
                className="absolute inset-0 hidden h-full w-full object-cover dark:block"
                loading="lazy"
              />
            </div>
            <p className="mt-1.5 truncate text-[13px] font-semibold">{cat.title}</p>
            <p className="text-muted-foreground truncate text-[10px]">{cat.arabicTitle}</p>
          </Link>
        ))}
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
        <HomeSection title="Exclusives" seeAllHref="/search/collection/exclusives">
          {exclusives.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 7. Best for Tajweed */}
      {tajweed.length > 0 ? (
        <HomeSection title="Best for Tajweed" seeAllHref="/search/collection/tajweed">
          {tajweed.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 8. Best for Memorization */}
      {memorization.length > 0 ? (
        <HomeSection title="Best for Memorization" seeAllHref="/search/collection/memorization">
          {memorization.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </HomeSection>
      ) : null}

      {/* 9. Explore by Rewayah — canonical Qira'at teacher order, links to per-rewayah pages */}
      <HomeSection title="Explore by Rewayah">
        {getRewayatByTeacher()
          .flatMap((g) => g.entries)
          .map((rw) => (
            <Link
              key={rw.id}
              href={`/search/rewayah/${rw.id}`}
              className="flex aspect-[4/3] w-full flex-col justify-end rounded-xl bg-[var(--text-alpha-06)] p-3 transition-colors hover:bg-[var(--text-alpha-10)]"
            >
              <p className="text-[13px] font-semibold">{rw.displayName}</p>
              <p className="text-muted-foreground text-[10px]">{rw.teacher}</p>
            </Link>
          ))}
      </HomeSection>
    </div>
  );
}

function HomeSkeleton() {
  // Mirrors the real layout: two stacked sections (Featured + Adhkar) each
  // with a heading pill and a row of cards. Sized to the actual ReciterCard
  // grid so first paint doesn't shift when the real content swaps in.
  return (
    <div className="py-4 sm:py-6" aria-hidden="true">
      {[0, 1].map((section) => (
        <section key={section} className="mb-4 px-4 sm:mb-6 sm:px-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-surface-sunken h-4 w-32 animate-pulse rounded" />
            <div className="bg-surface-sunken h-4 w-16 animate-pulse rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2 p-1.5">
                <div className="bg-surface-sunken aspect-square animate-pulse rounded-md" />
                <div className="bg-surface-sunken h-3 w-3/4 animate-pulse rounded" />
                <div className="bg-surface-sunken h-2 w-1/2 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
