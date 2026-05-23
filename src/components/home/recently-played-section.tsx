"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, type MouseEvent } from "react";
import { useRecentlyPlayedStore } from "@/stores/recently-played-store";
import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/stores/player-store";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { createTrack } from "@/lib/audio-utils";
import { PlayIcon } from "@/components/icons";

const MAX_VISIBLE = 8;

export function RecentlyPlayedSection() {
  const entries = useRecentlyPlayedStore((s) => s.entries);
  const { reciters } = useReciters();
  const updateQueue = usePlayerStore((s) => s.updateQueue);
  const gate = useAuthGate();

  const visible = useMemo(() => entries.slice(0, MAX_VISIBLE), [entries]);

  if (visible.length === 0) return null;

  function handlePlay(reciterId: string, rewayatId: string, surahId: number, surahName: string) {
    return (e: MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      const reciter = reciters.find((r) => r.id === reciterId);
      const rewayat = reciter?.rewayat.find((rw) => rw.id === rewayatId);
      if (!reciter || !rewayat) return;
      const track = createTrack(reciter, rewayat, surahId, surahName);
      void updateQueue([track]);
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
                onClick={gate(
                  handlePlay(entry.reciterId, entry.rewayatId, entry.surahId, entry.surahName),
                )}
                aria-label={`Play ${entry.surahName} by ${entry.reciterName}`}
                className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong relative z-10 mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full opacity-0 shadow-lg transition-all group-hover:opacity-100 focus-visible:opacity-100"
              >
                <PlayIcon size={12} color="currentColor" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
