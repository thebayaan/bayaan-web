"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useReciters } from "@/hooks/use-reciters";
import { SearchInput } from "@/components/search/search-input";
import { ReciterCard } from "@/components/reciter-card";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import type { Reciter } from "@/types/reciter";
import Link from "next/link";

const surahs = surahData as unknown as Surah[];

interface SearchResult {
  type: "reciter" | "surah";
  reciter?: Reciter;
  surah?: Surah;
  score: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { reciters, isLoading } = useReciters();

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

    return [...reciterResults, ...surahResults].sort(
      (a, b) => a.score - b.score,
    );
  }, [query, reciterFuse, surahFuse]);

  const hasQuery = query.length >= 2;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <SearchInput
        value={query}
        onChange={setQuery}
        className="max-w-lg mb-6"
      />

      {hasQuery ? (
        <div>
          {results.length === 0 ? (
            <p className="text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((result) => {
                if (result.type === "reciter" && result.reciter) {
                  return (
                    <Link
                      key={`reciter-${result.reciter.id}`}
                      href={`/reciter/${result.reciter.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--text-alpha-04)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--text-alpha-06)] overflow-hidden shrink-0">
                        {result.reciter.image_url && (
                          <img
                            src={result.reciter.image_url}
                            alt={result.reciter.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {result.reciter.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          Reciter &middot;{" "}
                          {result.reciter.rewayat[0]?.style ?? ""}
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
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--text-alpha-04)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--text-alpha-06)] flex items-center justify-center text-sm font-medium shrink-0">
                        {result.surah.id}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {result.surah.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.surah.translated_name_english} &middot;{" "}
                          {result.surah.verses_count} verses
                        </p>
                      </div>
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      ) : (
        /* Explore view when search is empty */
        <div>
          <h2 className="text-lg font-bold mb-4">Browse</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[var(--text-alpha-06)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {reciters.slice(0, 24).map((reciter) => (
                <ReciterCard key={reciter.id} reciter={reciter} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
