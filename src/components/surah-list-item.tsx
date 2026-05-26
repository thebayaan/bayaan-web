"use client";

import type { Surah } from "@/types/quran";
import type { Reciter, Rewayat } from "@/types/reciter";
import { surahGlyphMap } from "@/data/surah-glyph-map";
import { useFavorites } from "@/hooks/use-favorites";
import { SurahRowMoreMenu } from "@/components/surah-row-more-menu";
import { HeartIcon } from "@/components/icons";

interface Props {
  surah: Surah;
  onPlay: (surahId: number) => void;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  /** Enables the per-row heart toggle + 3-dot menu. */
  actions?: { reciter: Reciter; rewayat: Rewayat };
}

export function SurahListItem({ surah, onPlay, isPlaying, isCurrentTrack, actions }: Props) {
  const paddedIndex = String(surah.id).padStart(2, "0");
  const { isFavorite, toggleFavorite } = useFavorites();
  const favoriteRef = actions
    ? { reciter_id: actions.reciter.id, rewayat_id: actions.rewayat.id, surah_id: surah.id }
    : null;
  const isLoved = favoriteRef ? isFavorite(favoriteRef) : false;

  return (
    <div
      // Plain wrapper — no role, no tabindex. The play affordance is the
      // <button> below. Nesting the heart/more-menu inside an outer
      // role="button" violates ARIA's interactive-in-interactive rule.
      className={`hover:bg-surface-raised duration-fast ease-standard group/row flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors sm:px-4 ${
        isCurrentTrack ? "bg-brand-light" : ""
      }`}
    >
      {/* Play affordance covers the # column + SURAH cell. */}
      <button
        type="button"
        aria-label={`Play ${surah.name}`}
        onClick={() => onPlay(surah.id)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md text-left focus-visible:ring-2 focus-visible:ring-[var(--brand-weak)] focus-visible:outline-none"
      >
        <span
          className={`w-8 shrink-0 text-center text-sm font-semibold tabular-nums sm:w-10 ${
            isCurrentTrack ? "text-brand-main" : "text-muted-foreground"
          }`}
        >
          {isPlaying && isCurrentTrack ? <EqualizerGlyph /> : paddedIndex}
        </span>

        {/* SURAH cell: English name on the left, Arabic glyph on the right. */}
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${
              isCurrentTrack ? "text-brand-main" : "text-foreground"
            }`}
          >
            {surah.name}
          </span>
          <span className="font-surah-names text-foreground shrink-0 text-[18px] leading-none">
            {surahGlyphMap[surah.id] ?? surah.name_arabic}
          </span>
        </span>
      </button>

      {/* Actions column: heart + 3-dot. Siblings of the play button so AT
       * users get clean, distinct controls without nested interactives. */}
      <div className="flex shrink-0 items-center gap-1">
        {favoriteRef ? (
          <button
            type="button"
            aria-label={
              isLoved ? `Remove ${surah.name} from favorites` : `Add ${surah.name} to favorites`
            }
            aria-pressed={isLoved}
            onClick={() => void toggleFavorite(favoriteRef)}
            className={`duration-fast ease-standard flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--text-alpha-10)] ${
              isLoved ? "text-[#ef4444]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HeartIcon size={16} color="currentColor" filled={isLoved} />
          </button>
        ) : null}
        {actions ? (
          <SurahRowMoreMenu
            reciter={actions.reciter}
            rewayat={actions.rewayat}
            surah={surah}
            className="text-muted-foreground hover:text-foreground duration-fast ease-standard flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--text-alpha-10)]"
          />
        ) : null}
      </div>

      {/* ENGLISH column */}
      <div className="text-muted-foreground hidden w-32 shrink-0 truncate text-sm font-medium sm:block">
        {surah.translated_name_english}
      </div>

      {/* REVELATION column */}
      <div className="text-muted-foreground hidden w-24 shrink-0 text-sm font-medium sm:block">
        {String(surah.revelation_place).toLowerCase() === "madinah" ? "Madinah" : "Makkah"}
      </div>

      {/* AYAHS column */}
      <div className="text-muted-foreground hidden w-12 shrink-0 text-right text-sm font-medium tabular-nums sm:block">
        {surah.verses_count}
      </div>
    </div>
  );
}

function EqualizerGlyph() {
  return (
    <span
      aria-label="Currently playing"
      className="inline-flex h-4 w-4 items-end justify-center gap-[2px] motion-reduce:animate-none"
    >
      <span className="bg-brand-main inline-block h-2 w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite] motion-reduce:animate-none" />
      <span className="bg-brand-main inline-block h-3 w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite_150ms] motion-reduce:animate-none" />
      <span className="bg-brand-main inline-block h-[6px] w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite_300ms] motion-reduce:animate-none" />
    </span>
  );
}
