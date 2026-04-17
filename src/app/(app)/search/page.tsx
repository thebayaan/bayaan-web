"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { useReciters } from "@/hooks/use-reciters";
import { EmptyState } from "@/components/ui/empty-state";
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

    return [...reciterResults, ...surahResults].sort((a, b) => a.score - b.score);
  }, [query, reciterFuse, surahFuse]);

  if (!query.trim()) {
    return (
      <EmptyState
        icon={
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        }
        title="Search Bayaan"
        subtitle="Press ⌘K (or click the search bar above) to find surahs, reciters, and adhkar."
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Search</h1>
      {results.length === 0 ? (
        <p className="text-muted-foreground">
          {isLoading ? "Searching…" : <>No results for &ldquo;{query}&rdquo;</>}
        </p>
      ) : (
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
      )}
    </div>
  );
}
