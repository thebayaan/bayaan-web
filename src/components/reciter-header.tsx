"use client";

import type { Reciter } from "@/types/reciter";
import { ReciterHeroPortrait } from "@/components/layout/reciter-hero-portrait";

interface Props {
  reciter: Reciter;
  totalSurahs: number;
  totalDurationLabel?: string;
}

export function ReciterHeader({ reciter, totalSurahs, totalDurationLabel }: Props) {
  return (
    <header className="flex flex-col items-center gap-4 px-4 pt-6 pb-6 text-center sm:flex-row sm:items-end sm:gap-9 sm:px-10 sm:pt-8 sm:pb-10 sm:text-left">
      <ReciterHeroPortrait name={reciter.name} imageUrl={reciter.image_url} />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pb-2 sm:gap-3">
        <h1 className="text-[32px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[48px] sm:leading-none lg:text-[64px]">
          {reciter.name}
        </h1>
        {reciter.name_arabic ? (
          <div className="text-muted-foreground text-lg sm:text-[22px]" dir="rtl">
            {reciter.name_arabic}
          </div>
        ) : null}
        <div className="text-muted-foreground flex items-center justify-center gap-3 text-sm font-medium sm:justify-start">
          <span>
            {totalSurahs} {totalSurahs === 1 ? "surah" : "surahs"}
          </span>
          {totalDurationLabel ? (
            <>
              <span className="bg-muted-foreground/40 h-[3px] w-[3px] rounded-full" aria-hidden />
              <span>{totalDurationLabel}</span>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
