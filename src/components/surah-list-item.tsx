"use client";

import { PlayIcon, PauseIcon } from "@/components/icons";
import type { Surah } from "@/types/quran";
import { cn } from "@/lib/utils";

interface SurahListItemProps {
  surah: Surah;
  onPlay: (surahId: number) => void;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
}

export function SurahListItem({ surah, onPlay, isPlaying, isCurrentTrack }: SurahListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--text-alpha-04)]",
        isCurrentTrack && "bg-[var(--text-alpha-06)]",
      )}
    >
      <div className="w-8 shrink-0 text-center">
        {isCurrentTrack && isPlaying ? (
          <div className="flex items-center justify-center gap-0.5">
            <span className="bg-foreground h-3 w-0.5 animate-pulse rounded-full" />
            <span className="bg-foreground h-4 w-0.5 animate-pulse rounded-full delay-75" />
            <span className="bg-foreground h-2 w-0.5 animate-pulse rounded-full delay-150" />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{surah.id}</span>
        )}
      </div>

      <div className={cn("min-w-0 flex-1", (isCurrentTrack || isPlaying) && "text-foreground")}>
        <p className="truncate text-sm font-medium">{surah.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          <span>{surah.translated_name_english}</span>
          {" · "}
          <span>{surah.verses_count} verses</span>
        </p>
      </div>

      <button
        onClick={() => onPlay(surah.id)}
        className="text-muted-foreground hover:text-foreground rounded-full p-2 opacity-0 transition-colors group-hover:opacity-100 hover:bg-[var(--text-alpha-06)] focus:opacity-100"
        aria-label={isPlaying && isCurrentTrack ? "Pause" : `Play ${surah.name}`}
      >
        {isPlaying && isCurrentTrack ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>
    </div>
  );
}
