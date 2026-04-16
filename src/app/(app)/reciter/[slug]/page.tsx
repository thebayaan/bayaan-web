"use client";

import { use, useState, useMemo } from "react";
import { useReciter } from "@/hooks/use-reciter";
import { usePlayerStore } from "@/stores/player-store";
import { ReciterHeader } from "@/components/reciter-header";
import { SurahListItem } from "@/components/surah-list-item";
import { PlayIcon, HeartIcon } from "@/components/icons";
import { createQueueFromSurah } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];
const surahNameMap = Object.fromEntries(surahs.map((s) => [s.id, s.name])) as Record<
  number,
  string
>;

export default function ReciterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { reciter, isLoading } = useReciter(slug);
  const [selectedRewayatIdx, setSelectedRewayatIdx] = useState(0);

  const updateQueue = usePlayerStore((s) => s.updateQueue);
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

  function handlePlayAll(): void {
    if (!reciter || !selectedRewayat) return;
    const firstSurah = selectedRewayat.surah_list[0];
    if (firstSurah === undefined) return;
    const { tracks } = createQueueFromSurah(reciter, selectedRewayat, firstSurah, surahNameMap);
    void updateQueue(tracks);
  }

  return (
    <div>
      <ReciterHeader reciter={reciter} totalSurahs={totalSurahs} />

      <div className="flex flex-wrap items-center gap-3 px-10 pb-8">
        <button
          onClick={handlePlayAll}
          type="button"
          className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong duration-fast ease-standard flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-[var(--elevation-s)] transition-colors"
        >
          <PlayIcon size={14} color="currentColor" />
          Play All
        </button>
        <button
          type="button"
          className="border-border hover:bg-surface-raised duration-fast ease-standard flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors"
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
          aria-label="Favorite reciter"
          className="border-border text-brand-main hover:bg-brand-light duration-fast ease-standard flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
        >
          <HeartIcon size={18} color="currentColor" />
        </button>
        <button
          type="button"
          aria-label="Share reciter"
          className="border-border hover:bg-surface-raised duration-fast ease-standard flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="More"
          className="border-border hover:bg-surface-raised duration-fast ease-standard flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      {reciter.rewayat.length > 1 && (
        <div className="border-border-divider flex items-center gap-8 border-b px-10">
          <span className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
            Recitation
          </span>
          <div className="flex items-center gap-7">
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
          </div>
          <div className="flex-1" />
          <span className="text-muted-foreground py-3.5 text-xs font-medium">
            {filteredSurahs.length} surahs · sorted by chapter
          </span>
        </div>
      )}

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
