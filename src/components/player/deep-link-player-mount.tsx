"use client";

import { useEffect } from "react";
import { useReciter } from "@/hooks/use-reciter";
import { usePlayerStore } from "@/stores/player-store";
import { createTrack } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];

interface DeepLinkPlayerMountProps {
  slug: string;
  surahNum: number;
  rewayah?: string;
  tSec?: number;
  autoplay: boolean;
}

export function DeepLinkPlayerMount({
  slug,
  surahNum,
  rewayah,
  tSec,
  autoplay,
}: DeepLinkPlayerMountProps): React.ReactElement | null {
  const { reciter, isLoading } = useReciter(slug);

  useEffect(() => {
    if (isLoading || !reciter) return;

    const targetRewayah = rewayah
      ? (reciter.rewayat.find((r) => r.id === rewayah) ?? reciter.rewayat[0])
      : reciter.rewayat[0];
    if (!targetRewayah) return;

    if (!targetRewayah.surah_list.includes(surahNum)) return;

    const surahName = surahs.find((s) => s.id === surahNum)?.name ?? `Surah ${surahNum}`;
    const track = createTrack(reciter, targetRewayah, surahNum, surahName);

    const store = usePlayerStore.getState();

    async function loadAndMaybePlay(): Promise<void> {
      await store.updateQueue([track]);
      if (tSec !== undefined && tSec > 0) {
        usePlayerStore.getState().seekTo(tSec * 1000);
      }
      if (autoplay) {
        try {
          await usePlayerStore.getState().play();
        } catch {
          // Browsers may block autoplay without prior user gesture.
          // The track is queued — user can tap play.
        }
      }
    }

    void loadAndMaybePlay();
    // We only want to fire this once per slug/surah combo — the params
    // are stable for the lifetime of this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, reciter?.id, slug, surahNum, rewayah, tSec, autoplay]);

  return null;
}
