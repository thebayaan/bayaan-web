"use client";

import { use, useState, useMemo } from "react";
import { useReciter } from "@/hooks/use-reciter";
import { usePlayerStore } from "@/stores/player-store";
import { ReciterHeader } from "@/components/reciter-header";
import { SurahListItem } from "@/components/surah-list-item";
import { PlayIcon } from "@/components/icons";
import { createQueueFromSurah } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];
const surahNameMap = Object.fromEntries(
  surahs.map((s) => [s.id, s.name]),
) as Record<number, string>;

export default function ReciterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

  if (isLoading || !reciter) {
    return (
      <div className="p-6 animate-pulse">
        <div className="flex items-end gap-6 mb-8">
          <div className="w-48 h-48 bg-[var(--text-alpha-06)] rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 w-20 bg-[var(--text-alpha-06)] rounded" />
            <div className="h-10 w-64 bg-[var(--text-alpha-06)] rounded" />
            <div className="h-4 w-40 bg-[var(--text-alpha-04)] rounded" />
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
      if (isPlaying) {
        pause();
      } else {
        void play();
      }
      return;
    }

    const { tracks } = createQueueFromSurah(
      reciter,
      selectedRewayat,
      surahId,
      surahNameMap,
    );
    void updateQueue(tracks);
  }

  function handlePlayAll(): void {
    if (!reciter || !selectedRewayat) return;
    const firstSurah = selectedRewayat.surah_list[0];
    if (firstSurah === undefined) return;
    const { tracks } = createQueueFromSurah(
      reciter,
      selectedRewayat,
      firstSurah,
      surahNameMap,
    );
    void updateQueue(tracks);
  }

  return (
    <div>
      <ReciterHeader reciter={reciter} />

      {reciter.rewayat.length > 1 && (
        <div className="flex gap-2 px-6 mb-4">
          {reciter.rewayat.map((rw, idx) => (
            <button
              key={rw.id}
              onClick={() => setSelectedRewayatIdx(idx)}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                idx === selectedRewayatIdx
                  ? "bg-foreground text-background font-medium"
                  : "bg-[var(--text-alpha-06)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {rw.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 px-6 mb-4">
        <button
          onClick={handlePlayAll}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-full font-medium text-sm hover:scale-105 transition-transform"
        >
          <PlayIcon size={16} color="currentColor" />
          Play All
        </button>
      </div>

      <div className="px-2">
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
