"use client";

import { use, useMemo } from "react";
import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/stores/player-store";
import { createTrack } from "@/lib/audio-utils";
import { PlayIcon } from "@/components/icons";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import Link from "next/link";

const surahs = surahData as unknown as Surah[];

export default function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const surahId = parseInt(id, 10);
  const surah = surahs.find((s) => s.id === surahId);
  const { reciters, isLoading } = useReciters();
  const updateQueue = usePlayerStore((s) => s.updateQueue);

  const availableReciters = useMemo(
    () =>
      reciters.filter((r) =>
        r.rewayat.some((rw) => rw.surah_list.includes(surahId)),
      ),
    [reciters, surahId],
  );

  if (!surah) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Surah not found</h1>
      </div>
    );
  }

  function handlePlayReciter(reciterId: string): void {
    const reciter = reciters.find((r) => r.id === reciterId);
    if (!reciter || !surah) return;
    const rewayat = reciter.rewayat.find((rw) =>
      rw.surah_list.includes(surahId),
    );
    if (!rewayat) return;
    const track = createTrack(reciter, rewayat, surahId, surah.name);
    void updateQueue([track]);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Surah {surah.id}
        </p>
        <h1 className="text-4xl font-bold">{surah.name}</h1>
        <p className="text-muted-foreground mt-1">
          {surah.translated_name_english} &middot; {surah.verses_count} verses
          &middot; {surah.revelation_place}
        </p>
      </div>

      <h2 className="text-lg font-bold mb-3">
        Available Reciters ({availableReciters.length})
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-[var(--text-alpha-06)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {availableReciters.map((reciter) => {
            const rewayat = reciter.rewayat.find((rw) =>
              rw.surah_list.includes(surahId),
            );
            return (
              <div
                key={reciter.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--text-alpha-04)] transition-colors group"
              >
                <Link
                  href={`/reciter/${reciter.slug}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--text-alpha-06)] overflow-hidden shrink-0">
                    {reciter.image_url && (
                      <img
                        src={reciter.image_url}
                        alt={reciter.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {reciter.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {rewayat?.style} &middot; {rewayat?.name}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handlePlayReciter(reciter.id)}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-[var(--text-alpha-06)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Play ${reciter.name}`}
                >
                  <PlayIcon size={16} color="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
