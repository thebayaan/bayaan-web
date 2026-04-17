"use client";

import { useReciters } from "@/hooks/use-reciters";
import { ReciterCard } from "@/components/reciter-card";
import { ContinueWhereYouLeftOff } from "@/components/home/continue-where-you-left-off";
import type { Reciter } from "@/types/reciter";

function ReciterSection({ title, reciters }: { title: string; reciters: Reciter[] }) {
  if (reciters.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="text-foreground mb-4 text-[22px] font-bold tracking-tight">{title}</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
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
          <div className="bg-surface-sunken h-8 w-48 rounded" />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="bg-surface-sunken aspect-square rounded-lg" />
                <div className="bg-surface-sunken h-3 w-3/4 rounded" />
                <div className="bg-surface-raised h-2.5 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ContinueWhereYouLeftOff />

      <ReciterSection title="Featured Reciters" reciters={featured} />
      <ReciterSection title="All Reciters" reciters={reciters.slice(0, 18)} />
      <ReciterSection title="Murattal" reciters={murattal.slice(0, 12)} />
      {mojawwad.length > 0 && <ReciterSection title="Mojawwad" reciters={mojawwad.slice(0, 12)} />}
    </div>
  );
}
