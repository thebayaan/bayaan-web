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

export function SurahListItem({
  surah,
  onPlay,
  isPlaying,
  isCurrentTrack,
}: SurahListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[var(--text-alpha-04)]",
        isCurrentTrack && "bg-[var(--text-alpha-06)]",
      )}
    >
      <div className="w-8 text-center shrink-0">
        {isCurrentTrack && isPlaying ? (
          <div className="flex items-center justify-center gap-0.5">
            <span className="w-0.5 h-3 bg-foreground rounded-full animate-pulse" />
            <span className="w-0.5 h-4 bg-foreground rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-foreground rounded-full animate-pulse delay-150" />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{surah.id}</span>
        )}
      </div>

      <div
        className={cn(
          "flex-1 min-w-0",
          (isCurrentTrack || isPlaying) && "text-foreground",
        )}
      >
        <p className="text-sm font-medium truncate">{surah.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          <span>{surah.translated_name_english}</span>
          {" · "}
          <span>{surah.verses_count} verses</span>
        </p>
      </div>

      <button
        onClick={() => onPlay(surah.id)}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-[var(--text-alpha-06)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={
          isPlaying && isCurrentTrack ? "Pause" : `Play ${surah.name}`
        }
      >
        {isPlaying && isCurrentTrack ? (
          <PauseIcon size={16} />
        ) : (
          <PlayIcon size={16} />
        )}
      </button>
    </div>
  );
}
