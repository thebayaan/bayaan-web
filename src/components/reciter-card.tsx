"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { Reciter } from "@/types/reciter";
import { usePlayerStore } from "@/stores/player-store";
import { createQueueFromSurah } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { cn } from "@/lib/utils";
import { PauseIcon, PlayIcon, ProfileIcon } from "@/components/icons";

interface ReciterCardProps {
  reciter: Reciter;
  className?: string;
}

const surahNameMap: Record<number, string> = (surahData as unknown as Surah[]).reduce(
  (acc, s) => {
    acc[s.id] = s.name;
    return acc;
  },
  {} as Record<number, string>,
);

export function ReciterCard({ reciter, className }: ReciterCardProps) {
  const rewayatCount = reciter.rewayat.length;
  const rewayatLabel =
    rewayatCount === 0
      ? ""
      : rewayatCount === 1
        ? (reciter.rewayat[0]?.name ?? "")
        : `${rewayatCount} rewayat`;

  const updateQueue = usePlayerStore((s) => s.updateQueue);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const currentTrack = usePlayerStore((s) => s.queue.tracks[s.queue.currentIndex]);

  const isThisReciterPlaying =
    isPlaying && currentTrack !== undefined && currentTrack.reciterId === reciter.id;

  function startPlayback(): void {
    const rewayat = reciter.rewayat[0];
    if (!rewayat) return;
    const firstSurah = rewayat.surah_list[0];
    if (firstSurah === undefined) return;
    if (currentTrack?.reciterId === reciter.id && currentTrack?.rewayatId === rewayat.id) {
      // Same reciter+rewayat already loaded — just resume.
      void play();
      return;
    }
    const { tracks } = createQueueFromSurah(reciter, rewayat, firstSurah, surahNameMap);
    void updateQueue(tracks);
  }

  function handlePlayClick(e: MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
    e.stopPropagation();
    if (isThisReciterPlaying) {
      pause();
      return;
    }
    startPlayback();
  }

  return (
    <div className={cn("group relative", className)}>
      <Link
        href={`/reciter/${reciter.slug}`}
        className="block w-full rounded-md p-1.5 transition-colors hover:bg-[var(--text-alpha-04)]"
      >
        <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--text-alpha-06)]">
          {reciter.image_url ? (
            <Image
              src={reciter.image_url}
              alt={reciter.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 30vw, (max-width: 1024px) 18vw, 14vw"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <ProfileIcon size={28} aria-hidden="true" />
            </div>
          )}
        </div>
        <p className="mt-1.5 truncate text-[13px] font-semibold">{reciter.name}</p>
        {rewayatLabel ? (
          <p className="text-muted-foreground mt-0.5 truncate text-[11px]">{rewayatLabel}</p>
        ) : null}
      </Link>
      <button
        type="button"
        onClick={handlePlayClick}
        aria-label={isThisReciterPlaying ? `Pause ${reciter.name}` : `Play ${reciter.name}`}
        className={cn(
          "bg-brand-main text-brand-main-foreground absolute right-2.5 flex h-10 w-10 items-center justify-center rounded-full shadow-xl transition-all duration-200",
          // Anchor the button at the bottom edge of the artwork
          "top-[calc(100%-3.25rem-3rem)] sm:top-[calc(100%-3.25rem-3.5rem)]",
          // Hover-only on fine-pointer devices; always visible on touch
          // devices (group-hover:* never fires without a hover-capable
          // pointer) and when this reciter is currently playing.
          isThisReciterPlaying
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-90",
          "hover:bg-brand-strong hover:scale-105",
        )}
      >
        {isThisReciterPlaying ? (
          <PauseIcon size={14} aria-hidden="true" />
        ) : (
          <PlayIcon size={14} aria-hidden="true" className="translate-x-[1px]" />
        )}
      </button>
    </div>
  );
}
