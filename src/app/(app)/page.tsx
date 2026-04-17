"use client";

import { useReciters } from "@/hooks/use-reciters";
import { ReciterCard } from "@/components/reciter-card";
import type { Reciter } from "@/types/reciter";

function ReciterSection({ title, reciters }: { title: string; reciters: Reciter[] }) {
  if (reciters.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {reciters.map((reciter) => (
          <ReciterCard key={reciter.id} reciter={reciter} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { reciters, featured, isLoading } = useReciters();

  const murattal = reciters.filter((r) => r.rewayat.some((rw) => rw.style === "murattal"));
  const mojawwad = reciters.filter((r) => r.rewayat.some((rw) => rw.style === "mojawwad"));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 rounded bg-[var(--text-alpha-06)]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square rounded-lg bg-[var(--text-alpha-06)]" />
                <div className="h-4 w-3/4 rounded bg-[var(--text-alpha-06)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--text-alpha-04)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ReciterSection title="Featured Reciters" reciters={featured} />
      <ReciterSection title="All Reciters" reciters={reciters.slice(0, 18)} />
      <ReciterSection title="Murattal" reciters={murattal.slice(0, 12)} />
      {mojawwad.length > 0 && <ReciterSection title="Mojawwad" reciters={mojawwad.slice(0, 12)} />}
    </div>
  );
}
