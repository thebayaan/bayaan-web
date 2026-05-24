"use client";

import Link from "next/link";
import type { JuzIndexEntry } from "@/data/juz-data";

interface JuzIndexCardProps {
  entry: JuzIndexEntry;
}

export function JuzIndexCard({ entry }: JuzIndexCardProps) {
  const [surahId, ayah] = entry.startVerseKey.split(":");

  return (
    <Link
      href={`/mushaf/${entry.startPage}`}
      className="border-border bg-surface hover:bg-surface-raised duration-fast ease-standard group flex items-start gap-4 rounded-xl border p-4 transition-colors"
    >
      <div className="bg-brand-light text-brand-main flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums">
        {entry.juz}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-[15px] font-semibold">{entry.label}</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Page {entry.startPage} · {entry.startVerseKey}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs group-hover:text-foreground transition-colors">
          Open in mushaf
        </p>
      </div>
      <span className="text-muted-foreground text-xs tabular-nums">
        {surahId}:{ayah}
      </span>
    </Link>
  );
}
