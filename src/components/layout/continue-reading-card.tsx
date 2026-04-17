"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];
const surahById = new Map<number, Surah>(surahs.map((s) => [s.id, s]));

const TOTAL_MUSHAF_PAGES = 604;

export function ContinueReadingCard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const lastReadSurahId = useReadingSettingsStore((s) => s.lastReadSurahId);
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);

  if (!mounted || lastReadSurahId == null) return null;
  const surah = surahById.get(lastReadSurahId);
  if (!surah) return null;

  const percent = Math.max(0, Math.min(100, Math.round((mushafPage / TOTAL_MUSHAF_PAGES) * 100)));

  return (
    <Link
      href={`/quran/${surah.id}`}
      className="bg-brand-light hover:bg-brand-weak duration-fast ease-standard flex flex-col gap-2 rounded-xl border border-[var(--brand-weak)] p-3 transition-colors"
    >
      <div className="text-brand-main flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="hidden lg:inline">Continue reading</span>
      </div>
      <div className="hidden items-baseline justify-between gap-2 lg:flex">
        <span className="text-foreground text-sm font-semibold">{surah.name}</span>
        <span className="text-muted-foreground text-xs">Surah {surah.id}</span>
      </div>
      <div className="hidden flex-col gap-1 lg:flex">
        <div className="text-muted-foreground text-[11px] font-medium">
          {percent}% · page {mushafPage} of {TOTAL_MUSHAF_PAGES}
        </div>
        <div
          className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--brand-weak)]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="bg-brand-main h-full rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </Link>
  );
}
