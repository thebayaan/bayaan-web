"use client";

import { useEffect, useMemo, useState } from "react";
import { useReciter } from "@/hooks/use-reciter";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { usePlayerStore } from "@/stores/player-store";
import { ReciterHeader } from "@/components/reciter-header";
import { SurahListItem } from "@/components/surah-list-item";
import { ReciterMoreMenu } from "@/components/reciter-more-menu";
import { HeartIcon, PlayIcon, ShareIcon } from "@/components/icons";
import { createQueueFromSurah } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

async function shareReciter(name: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof window === "undefined") return "failed";
  const url = window.location.href;
  const nav = window.navigator;
  if (typeof nav.share === "function") {
    try {
      await nav.share({ title: name, url });
      return "shared";
    } catch (err) {
      // User aborted the share sheet — treat as no-op, not an error.
      if (err instanceof Error && err.name === "AbortError") return "shared";
      // Fall through to clipboard on any other error.
    }
  }
  if (nav.clipboard) {
    try {
      await nav.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }
  return "failed";
}

const surahs = surahData as unknown as Surah[];
const surahNameMap = Object.fromEntries(surahs.map((s) => [s.id, s.name])) as Record<
  number,
  string
>;

interface ReciterPageClientProps {
  slug: string;
}

export function ReciterPageClient({ slug }: ReciterPageClientProps) {
  const { reciter, isLoading } = useReciter(slug);
  const [selectedRewayatIdx, setSelectedRewayatIdx] = useState(0);
  const { isFavoriteReciter, toggleFavoriteReciter } = useFavoriteReciters();
  const isFavorited = reciter ? isFavoriteReciter(reciter.id) : false;
  const [shareToast, setShareToast] = useState<"shared" | "copied" | "failed" | null>(null);
  useEffect(() => {
    if (!shareToast) return undefined;
    const t = window.setTimeout(() => setShareToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [shareToast]);

  const updateQueue = usePlayerStore((s) => s.updateQueue);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const isShuffle = usePlayerStore((s) => s.settings.shuffle);
  const currentTrack = usePlayerStore((s) => {
    const tracks = s.queue.tracks;
    const idx = s.queue.currentIndex;
    return tracks[idx];
  });
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);

  const selectedRewayat = reciter?.rewayat[selectedRewayatIdx];

  const filteredSurahs = useMemo(() => {
    if (!selectedRewayat) return [];
    const surahSet = new Set(selectedRewayat.surah_list);
    return surahs.filter((s) => surahSet.has(s.id));
  }, [selectedRewayat]);

  const totalSurahs = reciter?.rewayat.reduce((sum, rw) => Math.max(sum, rw.surah_total), 0) ?? 0;

  if (isLoading || !reciter) {
    return (
      <div className="animate-pulse p-10">
        <div className="mb-8 flex items-end gap-9">
          <div className="bg-surface-sunken h-[220px] w-[220px] rounded-full" />
          <div className="space-y-3 pb-2">
            <div className="bg-surface-sunken h-4 w-20 rounded" />
            <div className="bg-surface-sunken h-14 w-80 rounded" />
            <div className="bg-surface-sunken h-4 w-40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  function handlePlaySurah(surahId: number): void {
    if (!reciter || !selectedRewayat) return;
    if (
      currentTrack?.reciterId === reciter.id &&
      currentTrack?.surahId === surahId &&
      currentTrack?.rewayatId === selectedRewayat.id
    ) {
      if (isPlaying) pause();
      else void play();
      return;
    }
    const { tracks } = createQueueFromSurah(reciter, selectedRewayat, surahId, surahNameMap);
    void updateQueue(tracks);
  }

  function handlePlayAll(startFromRandom = false): void {
    if (!reciter || !selectedRewayat) return;
    const list = selectedRewayat.surah_list;
    const firstSurah = list[0];
    if (firstSurah === undefined) return;
    const startSurah = startFromRandom
      ? (list[Math.floor(Math.random() * list.length)] ?? firstSurah)
      : firstSurah;
    const { tracks } = createQueueFromSurah(reciter, selectedRewayat, startSurah, surahNameMap);
    void updateQueue(tracks);
  }

  return (
    <div>
      <ReciterHeader reciter={reciter} totalSurahs={totalSurahs} />

      <div className="flex flex-wrap items-center gap-3 px-4 pb-6 sm:px-10 sm:pb-8">
        <button
          onClick={() => handlePlayAll()}
          type="button"
          className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong duration-fast ease-standard flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-[var(--elevation-s)] transition-colors"
        >
          <PlayIcon size={14} color="currentColor" />
          Play All
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isShuffle) toggleShuffle();
            handlePlayAll(true);
          }}
          className={`border-border hover:bg-surface-raised duration-fast ease-standard flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors ${
            isShuffle ? "text-brand-main border-[var(--brand-weak)]" : ""
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          Shuffle
        </button>
        <button
          type="button"
          aria-label={isFavorited ? "Unfavorite reciter" : "Favorite reciter"}
          aria-pressed={isFavorited}
          onClick={() => {
            void toggleFavoriteReciter(reciter.id);
          }}
          className={`border-border hover:bg-brand-light duration-fast ease-standard flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
            isFavorited
              ? "text-brand-main bg-brand-light border-[var(--brand-weak)]"
              : "text-muted-foreground"
          }`}
        >
          <HeartIcon size={18} color="currentColor" filled={isFavorited} />
        </button>
        <div className="relative">
          <button
            type="button"
            aria-label="Share reciter"
            onClick={() => {
              void shareReciter(reciter.name).then(setShareToast);
            }}
            className="border-border hover:bg-surface-raised duration-fast ease-standard text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
          >
            <ShareIcon size={18} aria-hidden="true" />
          </button>
          {shareToast === "copied" || shareToast === "failed" ? (
            <span
              role="status"
              aria-live="polite"
              className="bg-foreground text-background pointer-events-none absolute right-0 -bottom-9 z-30 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-lg"
            >
              {shareToast === "copied" ? "Link copied" : "Couldn't share"}
            </span>
          ) : null}
        </div>
        <ReciterMoreMenu
          reciter={reciter}
          rewayat={selectedRewayat}
          surahNameMap={surahNameMap}
          className="border-border hover:bg-surface-raised duration-fast ease-standard text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
        />
      </div>

      <div className="border-border-divider flex items-center gap-5 overflow-x-auto border-b px-4 sm:gap-7 sm:px-10">
        {reciter.rewayat.map((rw, idx) => {
          const active = idx === selectedRewayatIdx;
          return (
            <button
              key={rw.id}
              type="button"
              onClick={() => setSelectedRewayatIdx(idx)}
              className={`-mb-px border-b-2 py-3.5 text-sm transition-colors ${
                active
                  ? "text-foreground border-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground border-transparent font-medium"
              }`}
            >
              {rw.name}
            </button>
          );
        })}
        <div className="flex-1" />
        <span className="text-muted-foreground py-3.5 text-xs font-medium">
          {filteredSurahs.length} surahs · sorted by chapter
        </span>
      </div>

      <div className="px-4 pt-4 pb-24">
        {filteredSurahs.map((surah) => {
          const isCurrent =
            currentTrack?.reciterId === reciter.id &&
            currentTrack?.surahId === surah.id &&
            currentTrack?.rewayatId === selectedRewayat?.id;
          return (
            <div key={surah.id} className="group">
              <SurahListItem
                surah={surah}
                onPlay={handlePlaySurah}
                isPlaying={isPlaying && isCurrent}
                isCurrentTrack={isCurrent}
                playlistItem={
                  selectedRewayat
                    ? { reciter_id: reciter.id, rewayat_id: selectedRewayat.id }
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
