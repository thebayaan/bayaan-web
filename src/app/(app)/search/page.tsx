"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import Image from "next/image";
import { useReciters } from "@/hooks/use-reciters";
import { useRecentSearchesStore } from "@/stores/recent-searches-store";
import { getFeaturedReciters } from "@/data/reciter-collections";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import type { Reciter } from "@/types/reciter";
import Link from "next/link";
import { parseMushafSearchQuery } from "@/lib/mushaf-navigation";
import { QuranSearchResults } from "@/components/search/quran-search-results";

// Popular surahs to seed the empty state. These mirror what most Quran apps
// surface as "common reads" and give the page somewhere to start exploring
// rather than the user staring at a static hint.
const POPULAR_SURAH_IDS = [1, 18, 36, 55, 67, 112, 113, 114] as const;

const surahs = surahData as unknown as Surah[];

interface SearchResult {
  type: "reciter" | "surah";
  reciter?: Reciter;
  surah?: Surah;
  score: number;
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { reciters, isLoading } = useReciters();
  const pushRecentSearch = useRecentSearchesStore((s) => s.push);

  const reciterFuse = useMemo(
    () =>
      new Fuse(reciters, {
        keys: [
          { name: "name", weight: 2 },
          { name: "name_arabic", weight: 2 },
        ],
        threshold: 0.4,
        distance: 200,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [reciters],
  );

  const surahFuse = useMemo(
    () =>
      new Fuse(surahs, {
        keys: [
          { name: "name", weight: 2 },
          { name: "name_arabic", weight: 2 },
          { name: "translated_name_english", weight: 1.5 },
        ],
        threshold: 0.4,
        distance: 200,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [],
  );

  const mushafResults = useMemo(() => parseMushafSearchQuery(query), [query]);

  const results = useMemo<SearchResult[]>(() => {
    if (query.length < 2) return [];

    const reciterResults = reciterFuse.search(query).map((r) => ({
      type: "reciter" as const,
      reciter: r.item,
      score: r.score ?? 1,
    }));

    const surahResults = surahFuse.search(query).map((r) => ({
      type: "surah" as const,
      surah: r.item,
      score: r.score ?? 1,
    }));

    return [...reciterResults, ...surahResults].sort((a, b) => a.score - b.score);
  }, [query, reciterFuse, surahFuse]);

  // Record a search once we have results for it. Waiting until results land
  // (rather than recording on every keystroke) keeps the history list to
  // queries the user actually committed to.
  useEffect(() => {
    if (results.length > 0) {
      pushRecentSearch(query);
    }
  }, [query, results.length, pushRecentSearch]);

  if (!query.trim()) {
    return <SearchEmptyState reciters={reciters} />;
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <QuranSearchResults query={query} />
      {results.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Surahs & reciters
          </h2>
          <div className="space-y-2">
            {results.map((result) => {
              if (result.type === "reciter" && result.reciter) {
                return (
                  <Link
                    key={`reciter-${result.reciter.id}`}
                    href={`/reciter/${result.reciter.slug}`}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--text-alpha-06)]">
                      {result.reciter.image_url && (
                        <img
                          src={result.reciter.image_url}
                          alt={result.reciter.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{result.reciter.name}</p>
                      <p className="text-muted-foreground text-xs capitalize">
                        Reciter &middot; {result.reciter.rewayat[0]?.style ?? ""}
                      </p>
                    </div>
                  </Link>
                );
              }
              if (result.type === "surah" && result.surah) {
                return (
                  <Link
                    key={`surah-${result.surah.id}`}
                    href={`/quran/${result.surah.id}`}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm font-medium">
                      {result.surah.id}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{result.surah.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {result.surah.translated_name_english} &middot; {result.surah.verses_count}{" "}
                        verses
                      </p>
                    </div>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </section>
      ) : mushafResults.length === 0 && query.trim().length >= 3 ? null : (
        <p className="text-muted-foreground">
          {isLoading ? "Searching…" : <>No surah or reciter matches for &ldquo;{query}&rdquo;</>}
        </p>
      )}
    </div>
  );
}

function SearchEmptyState({ reciters }: { reciters: Reciter[] }) {
  const popularSurahs = useMemo(
    () =>
      POPULAR_SURAH_IDS.map((id) => surahs.find((s) => s.id === id)).filter(
        (s): s is Surah => s !== undefined,
      ),
    [],
  );
  const featured = useMemo(() => getFeaturedReciters(reciters).slice(0, 6), [reciters]);
  const recentSearches = useRecentSearchesStore((s) => s.entries);
  const removeRecentSearch = useRecentSearchesStore((s) => s.remove);
  const clearAllRecentSearches = useRecentSearchesStore((s) => s.clearAll);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Search Bayaan</h1>
        <p className="text-muted-foreground text-sm">
          Find surahs, reciters, mushaf pages, juz, verses, and translation text. Press ⌘K from
          anywhere.
        </p>
      </div>

      {recentSearches.length > 0 ? (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Recent searches
            </h2>
            <button
              type="button"
              onClick={clearAllRecentSearches}
              className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {recentSearches.map((entry) => (
              <li
                key={entry.query}
                className="border-border bg-surface-raised inline-flex items-center gap-1.5 rounded-full border pl-3 text-sm"
              >
                <Link
                  href={`/search?q=${encodeURIComponent(entry.query)}`}
                  className="duration-fast ease-standard py-1.5 transition-colors hover:underline"
                >
                  {entry.query}
                </Link>
                <button
                  type="button"
                  onClick={() => removeRecentSearch(entry.query)}
                  aria-label={`Remove "${entry.query}" from recent searches`}
                  className="text-muted-foreground hover:text-foreground -mr-0.5 rounded-full p-1 transition-colors hover:bg-[var(--text-alpha-10)]"
                >
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-8">
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Popular surahs
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/quran/${surah.id}`}
              className="border-border hover:bg-surface-raised duration-fast ease-standard inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
            >
              <span className="text-muted-foreground tabular-nums">{surah.id}</span>
              <span>{surah.name}</span>
              <span className="text-muted-foreground text-xs">{surah.translated_name_english}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <section>
          <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Featured reciters
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((r) => (
              <Link
                key={r.id}
                href={`/reciter/${r.slug}`}
                className="group rounded-md p-1.5 transition-colors hover:bg-[var(--text-alpha-04)]"
              >
                <div className="bg-muted relative aspect-square overflow-hidden rounded-md">
                  {r.image_url ? (
                    <Image
                      src={r.image_url}
                      alt={r.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 14vw"
                    />
                  ) : null}
                </div>
                <p className="mt-1.5 truncate text-[13px] font-semibold">{r.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
