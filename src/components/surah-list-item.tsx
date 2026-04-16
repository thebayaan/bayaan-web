"use client";

import type { Surah } from "@/types/quran";

interface Props {
  surah: Surah;
  onPlay: (surahId: number) => void;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  playlistItem?: { reciter_id: string; rewayat_id: string };
  durationLabel?: string;
}

export function SurahListItem({ surah, onPlay, isPlaying, isCurrentTrack, durationLabel }: Props) {
  const paddedIndex = String(surah.id).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={() => onPlay(surah.id)}
      className={`hover:bg-surface-raised duration-fast ease-standard group/row flex w-full items-center gap-5 rounded-xl px-5 py-3 text-left transition-colors ${
        isCurrentTrack ? "bg-brand-light" : ""
      }`}
    >
      <div
        className={`w-9 shrink-0 text-center text-sm font-semibold tabular-nums ${
          isCurrentTrack ? "text-brand-main" : "text-muted-foreground"
        }`}
      >
        {isPlaying && isCurrentTrack ? <EqualizerGlyph /> : paddedIndex}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div
          className={`truncate text-[15px] font-semibold ${
            isCurrentTrack ? "text-brand-main" : "text-foreground"
          }`}
        >
          {surah.name}
        </div>
        <div className="text-muted-foreground truncate text-xs font-medium">
          {surah.translated_name_english} · {surah.verses_count} ayahs
        </div>
      </div>
      <div className="font-surah-names text-foreground w-40 shrink-0 text-right text-[22px]">
        {surah.name_arabic}
      </div>
      <div className="text-muted-foreground w-[72px] shrink-0 text-right text-[13px] font-medium tabular-nums">
        {durationLabel ?? ""}
      </div>
      <div className="flex w-16 shrink-0 items-center justify-end gap-1">
        <span
          className="text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
        <span
          className="text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </span>
      </div>
    </button>
  );
}

function EqualizerGlyph() {
  return (
    <span
      aria-label="Currently playing"
      className="inline-flex h-4 w-4 items-end justify-center gap-[2px]"
    >
      <span className="bg-brand-main inline-block h-2 w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite]" />
      <span className="bg-brand-main inline-block h-3 w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite_150ms]" />
      <span className="bg-brand-main inline-block h-[6px] w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite_300ms]" />
    </span>
  );
}
