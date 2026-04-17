"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useReciters } from "@/hooks/use-reciters";
import { ReciterCard } from "@/components/reciter-card";
import { getRewayatById, REWAYAT_REGISTRY, type RewayatEntry } from "@/data/rewayat-registry";
import { normalize } from "@/lib/normalize";

function RewayahContent({ entry }: { entry: RewayatEntry }) {
  const { reciters, isLoading } = useReciters();
  const normalizedName = normalize(entry.name);

  const matching = useMemo(() => {
    return reciters.filter((r) =>
      r.rewayat.some(
        (rw) =>
          normalize(rw.name).includes(normalizedName) ||
          normalizedName.includes(normalize(rw.name)),
      ),
    );
  }, [reciters, normalizedName]);

  const siblings = REWAYAT_REGISTRY.filter((r) => r.teacher === entry.teacher && r.id !== entry.id);

  return (
    <div className="p-6">
      <Link
        href="/search"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex text-sm transition-colors"
      >
        &larr; Search
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{entry.displayName}</h1>
      <p className="text-muted-foreground text-sm">{entry.description}</p>
      <p className="text-muted-foreground mt-0.5 text-xs">Qira&apos;at teacher: {entry.teacher}</p>

      {siblings.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {siblings.map((s) => (
            <Link
              key={s.id}
              href={`/search/rewayah/${s.id}`}
              className="rounded-full border border-[var(--text-alpha-10)] px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              {s.displayName}
            </Link>
          ))}
        </div>
      ) : null}

      <h2 className="mt-6 mb-3 text-sm font-semibold">
        {matching.length} {matching.length === 1 ? "reciter" : "reciters"}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square rounded-lg bg-[var(--text-alpha-06)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--text-alpha-06)]" />
            </div>
          ))}
        </div>
      ) : matching.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No reciters found for this rewayah yet.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {matching.map((r) => (
            <ReciterCard key={r.id} reciter={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RewayahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const entry = getRewayatById(id);
  if (!entry) {
    return (
      <div className="p-6">
        <Link href="/search" className="text-muted-foreground text-sm">
          &larr; Search
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Rewayah not found</h1>
      </div>
    );
  }
  return <RewayahContent entry={entry} />;
}
