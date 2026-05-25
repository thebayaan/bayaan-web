"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JuzIndexEntry } from "@/data/juz-data";
import { getMushafReaderPath, navigateToMushafPage } from "@/lib/mushaf-navigation";

interface JuzIndexCardProps {
  entry: JuzIndexEntry;
}

export function JuzIndexCard({ entry }: JuzIndexCardProps) {
  const router = useRouter();
  const [surahId, ayah] = entry.startVerseKey.split(":");
  const href = getMushafReaderPath(entry.startPage);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    navigateToMushafPage(entry.startPage, router);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
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
        <p className="text-muted-foreground group-hover:text-foreground mt-0.5 text-xs transition-colors">
          Open in mushaf
        </p>
      </div>
      <span className="text-muted-foreground text-xs tabular-nums">
        {surahId}:{ayah}
      </span>
    </Link>
  );
}
