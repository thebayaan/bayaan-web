"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useReciters } from "@/hooks/use-reciters";
import { ReciterCard } from "@/components/reciter-card";
import {
  getFeaturedReciters,
  getExclusives,
  getTajweedReciters,
  getMemorizationReciters,
  getBeginnerFriendlyReciters,
} from "@/data/reciter-collections";
import type { Reciter } from "@/types/reciter";

const COLLECTIONS: Record<
  string,
  { title: string; description: string; filter: (reciters: Reciter[]) => Reciter[] }
> = {
  featured: {
    title: "Featured Reciters",
    description: "Spotlight reciters chosen by Bayaan.",
    filter: getFeaturedReciters,
  },
  exclusives: {
    title: "Exclusives",
    description: "Exclusive recitations curated by Bayaan.",
    filter: getExclusives,
  },
  tajweed: {
    title: "Best for Tajweed",
    description: "Reciters known for excellent tajweed and correct pronunciation.",
    filter: getTajweedReciters,
  },
  memorization: {
    title: "Best for Memorization",
    description: "Reciters with clear, measured pace ideal for memorization.",
    filter: getMemorizationReciters,
  },
  "beginner-friendly": {
    title: "New to Quran? Start Here",
    description: "Approachable and easy to listen to for first-time listeners.",
    filter: getBeginnerFriendlyReciters,
  },
};

export default function CollectionTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const collection = COLLECTIONS[type];
  const { reciters, isLoading } = useReciters();

  const filtered = useMemo(() => {
    if (!collection) return [];
    return collection.filter(reciters);
  }, [collection, reciters]);

  if (!collection) {
    return (
      <div className="p-6">
        <Link href="/search" className="text-muted-foreground text-sm">
          &larr; Search
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Collection not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex text-sm transition-colors"
      >
        &larr; Home
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{collection.title}</h1>
      <p className="text-muted-foreground text-sm">{collection.description}</p>
      <p className="text-muted-foreground mt-1 text-xs">
        {filtered.length} {filtered.length === 1 ? "reciter" : "reciters"}
      </p>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square rounded-md bg-[var(--text-alpha-06)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--text-alpha-06)]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {filtered.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </div>
      )}
    </div>
  );
}
