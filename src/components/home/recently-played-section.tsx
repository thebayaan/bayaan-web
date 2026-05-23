"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, type MouseEvent } from "react";
import { useRecentlyPlayedStore } from "@/stores/recently-played-store";
import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/stores/player-store";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { createQueueFromSurah } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { PlayIcon } from "@/components/icons";

const MAX_VISIBLE = 8;

const surahNameMap: Record<number, string> = (surahData as unknown as Surah[]).reduce(
  (acc, s) => {
    acc[s.id] = s.name;
    return acc;
  },
  {} as Record<number, string>,
);

export function RecentlyPlayedSection() {
  const entries = useRecentlyPlayedStore((s) => s.entries);
  const { reciters, isLoading: recitersLoading } = useReciters();
  const updateQueue = usePlayerStore((s) => s.updateQueue);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const currentTrack = usePlayerStore((s) => s.queue.tracks[s.queue.currentIndex]);
  const gate = useAuthGate();

  const visible = useMemo(() => entries.slice(0, MAX_VISIBLE), [entries]);

  if (visible.length === 0) return null;

  function isEntryActive(entry: {
    reciterId: string;
    rewayatId: string;
    surahId: number;
  }): boolean {
    return (
      currentTrack !== undefined &&
      currentTrack.reciterId === entry.reciterId &&
      currentTrack.rewayatId === entry.rewayatId &&
      currentTrack.surahId === entry.surahId
    );
  }

  function handlePlay(reciterId: string, rewayatId: string, surahId: number) {
    return (e: MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      const reciter = reciters.find((r) => r.id === reciterId);
      const rewayat = reciter?.rewayat.find((rw) => rw.id === rewayatId);
      if (!reciter || !rewayat) return;
      const active = isEntryActive({ reciterId, rewayatId, surahId });
      if (active) {
        if (isPlaying) pause();
        else void play();
        return;
      }
      // Load the full rewayat from the chosen surah onward so playback
      // continues naturally past the recording the user clicked. Without
      // this, the queue would be a single track and skipToNext would
      // dead-end at "end of queue".
      const { tracks } = createQueueFromSurah(reciter, rewayat, surahId, surahNameMap);
      if (tracks.length === 0) return;
      void updateQueue(tracks);
    };
  }

  return (
    <section className="mb-4 px-4 sm:mb-6 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">Recently played</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((entry) => {
          const reciter = reciters.find((r) => r.id === entry.reciterId);
          const active = isPlaying && isEntryActive(entry);
          // Reciter list may still be in-flight on first render. Disable the
          // play button until it resolves so taps aren't silently swallowed.
          const playReady = reciters.some((r) => r.id === entry.reciterId);
          return (
            <div
              key={`${entry.reciterId}/${entry.rewayatId}/${entry.surahId}`}
              className="group bg-surface-raised hover:bg-surface relative flex items-center gap-3 overflow-hidden rounded-md p-2 transition-colors"
            >
              <Link
                href={reciter ? `/reciter/${reciter.slug}` : "/quran"}
                className="absolute inset-0 z-0"
                aria-label={`Open ${entry.reciterName}`}
              />
              <div className="bg-muted relative z-10 h-14 w-14 shrink-0 overflow-hidden rounded">
                {entry.artwork ? (
                  <Image
                    src={entry.artwork}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="relative z-10 min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{entry.surahName}</p>
                <p className="text-muted-foreground truncate text-xs">{entry.reciterName}</p>
              </div>
              <button
                type="button"
                disabled={!playReady && recitersLoading}
                onClick={gate(handlePlay(entry.reciterId, entry.rewayatId, entry.surahId))}
                aria-label={
                  active
                    ? `Pause ${entry.surahName} by ${entry.reciterName}`
                    : `Play ${entry.surahName} by ${entry.reciterName}`
                }
                className={`bg-brand-main text-brand-main-foreground hover:bg-brand-strong relative z-10 mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-40 ${
                  active
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-90"
                }`}
              >
                {active ? (
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                ) : (
                  <PlayIcon size={12} color="currentColor" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
