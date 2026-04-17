"use client";

import Link from "next/link";
import type { Surah } from "@/types/quran";
import { surahGlyphMap } from "@/data/surah-glyph-map";

interface Props {
  surah: Surah;
  isResume?: boolean;
}

export function SurahIndexCard({ surah, isResume }: Props) {
  const padded = String(surah.id).padStart(2, "0");
  return (
    <Link
      href={`/quran/${surah.id}`}
      className={`hover:bg-surface-raised duration-fast ease-standard flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
        isResume ? "bg-brand-light border-[var(--brand-weak)]" : "border-border"
      }`}
    >
      <div
        className={`w-10 shrink-0 text-center text-2xl font-light tabular-nums ${
          isResume ? "text-brand-main" : "text-muted-foreground"
        }`}
      >
        {padded}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="text-foreground truncate text-[15px] font-bold tracking-tight">
          {surah.name}
        </div>
        <div className="text-muted-foreground truncate text-xs font-medium">
          {surah.translated_name_english} · {surah.verses_count} ayahs
        </div>
      </div>
      <div className="font-surah-names text-foreground shrink-0 text-[28px] leading-none">
        {surahGlyphMap[surah.id] ?? surah.name_arabic}
      </div>
    </Link>
  );
}
