"use client";

import type { KeyboardEvent } from "react";
import type { Surah } from "@/types/quran";
import { surahGlyphMap } from "@/data/surah-glyph-map";
import { AddToPlaylistButton } from "@/components/playlists/add-to-playlist";

interface Props {
  surah: Surah;
  onPlay: (surahId: number) => void;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  playlistItem?: { reciter_id: string; rewayat_id: string };
  durationLabel?: string;
}

export function SurahListItem({
  surah,
  onPlay,
  isPlaying,
  isCurrentTrack,
  playlistItem,
  durationLabel,
}: Props) {
  const paddedIndex = String(surah.id).padStart(2, "0");

  function handleRowKey(e: KeyboardEvent<HTMLDivElement>): void {
    // Only fire on the row itself — not on focused child buttons.
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPlay(surah.id);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play ${surah.name}`}
      onClick={() => onPlay(surah.id)}
      onKeyDown={handleRowKey}
      className={`hover:bg-surface-raised duration-fast ease-standard group/row flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand-weak)] focus-visible:outline-none sm:gap-5 sm:px-5 ${
        isCurrentTrack ? "bg-brand-light" : ""
      }`}
    >
      <div
        className={`w-7 shrink-0 text-center text-sm font-semibold tabular-nums sm:w-9 ${
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
      <div className="font-surah-names text-foreground w-20 shrink-0 truncate text-right text-[22px] leading-none sm:w-40 sm:text-[28px]">
        {surahGlyphMap[surah.id] ?? surah.name_arabic}
      </div>
      <div className="text-muted-foreground hidden w-[72px] shrink-0 text-right text-[13px] font-medium tabular-nums sm:block">
        {durationLabel ?? ""}
      </div>
      <div className="hidden w-16 shrink-0 items-center justify-end gap-1 sm:flex">
        {playlistItem ? (
          <AddToPlaylistButton
            label={`Add ${surah.name} to a playlist`}
            item={{ ...playlistItem, surah_id: surah.id }}
            className="text-muted-foreground hover:text-foreground rounded-full p-1.5 opacity-0 transition-all group-hover/row:opacity-100 hover:bg-[var(--text-alpha-10)] focus-visible:opacity-100"
          />
        ) : null}
      </div>
    </div>
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
