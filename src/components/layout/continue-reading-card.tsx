"use client";

import Link from "next/link";
import { useContinueReading } from "@/hooks/use-continue-reading";

export function ContinueReadingCard() {
  const entry = useContinueReading();
  if (!entry) return null;

  return (
    <Link
      href={`/quran/${entry.surahId}?verse=${entry.verseId}`}
      className="bg-brand-light hover:bg-brand-weak duration-fast ease-standard flex flex-col gap-2 rounded-xl border border-[var(--brand-weak)] p-3 transition-colors"
    >
      <div className="text-brand-main flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="hidden lg:inline">Continue reading</span>
      </div>
      <div className="hidden items-baseline justify-between gap-2 lg:flex">
        <span className="text-foreground text-sm font-semibold">{entry.surahName}</span>
        <span className="text-muted-foreground text-xs">v. {entry.verseId}</span>
      </div>
    </Link>
  );
}
