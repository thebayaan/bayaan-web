"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { getSurahReadingProgress } from "@/lib/surah-pages";

const surahs = surahData as unknown as Surah[];
const surahById = new Map<number, Surah>(surahs.map((s) => [s.id, s]));

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

  // Progress is computed against the surah's own page range — `mushafPage`
  // is the user's last-visited Madani mushaf page (a global 1..604 index)
  // but for "Continue reading Al-Baqarah" the meaningful denominator is
  // how many pages Al-Baqarah itself spans, not the entire Qur'an. The
  // helper clamps `mushafPage` into the surah range so we never show
  // confusing things like "page 50 of 49" when the user scrolled past the
  // end of the surah they originally opened.
  const progress = getSurahReadingProgress(surah, mushafPage);

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
      {progress ? (
        <div className="hidden flex-col gap-1 lg:flex">
          <div className="text-muted-foreground text-[11px] font-medium">
            {progress.percent}% · page {progress.pageInSurah} of {progress.totalPages}
          </div>
          <div
            className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--brand-weak)]"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bg-brand-main h-full rounded-full"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
