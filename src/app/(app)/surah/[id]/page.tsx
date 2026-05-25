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

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const surahId = parseInt(id, 10);
  const surah = surahs.find((s) => s.id === surahId);
  const { reciters, isLoading } = useReciters();
  const updateQueue = usePlayerStore((s) => s.updateQueue);

  const availableReciters = useMemo(
    () => reciters.filter((r) => r.rewayat.some((rw) => rw.surah_list.includes(surahId))),
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
    const rewayat = reciter.rewayat.find((rw) => rw.surah_list.includes(surahId));
    if (!rewayat) return;
    const track = createTrack(reciter, rewayat, surahId, surah.name);
    void updateQueue([track]);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
          Surah {surah.id}
        </p>
        <h1 className="text-4xl font-bold">{surah.name}</h1>
        <p className="text-muted-foreground mt-1">
          {surah.translated_name_english} &middot; {surah.verses_count} verses &middot;{" "}
          {surah.revelation_place}
        </p>
        <Link
          href={`/quran/${surah.id}`}
          className="border-border hover:bg-surface-raised duration-fast ease-standard mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Read this surah
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-bold">Available Reciters ({availableReciters.length})</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {availableReciters.map((reciter) => {
            const rewayat = reciter.rewayat.find((rw) => rw.surah_list.includes(surahId));
            return (
              <div
                key={reciter.id}
                className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
              >
                <Link
                  href={`/reciter/${reciter.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--text-alpha-06)]">
                    {reciter.image_url && (
                      <img
                        src={reciter.image_url}
                        alt={reciter.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{reciter.name}</p>
                    <p className="text-muted-foreground text-xs capitalize">
                      {rewayat?.style} &middot; {rewayat?.name}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handlePlayReciter(reciter.id)}
                  className="text-muted-foreground hover:text-foreground rounded-full p-2 opacity-0 transition-colors group-hover:opacity-100 hover:bg-[var(--text-alpha-06)] focus:opacity-100"
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
