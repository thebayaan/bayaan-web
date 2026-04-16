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
    <header className="flex items-end gap-9 px-10 pt-8 pb-10">
      <ReciterHeroPortrait name={reciter.name} imageUrl={reciter.image_url} />
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-2">
        <div className="text-brand-main flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase">
          <span className="bg-brand-main h-px w-4" aria-hidden />
          <span>Reciter</span>
        </div>
        <h1 className="text-[64px] leading-none font-extrabold tracking-[-0.03em]">
          {reciter.name}
        </h1>
        {reciter.name_arabic ? (
          <div className="font-surah-names text-muted-foreground text-[22px]">
            {reciter.name_arabic}
          </div>
        ) : null}
        <div className="text-muted-foreground flex items-center gap-3 text-sm font-medium">
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
