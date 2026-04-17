"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePlayerStore } from "@/stores/player-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { PlayIcon, QuranIcon } from "@/components/icons";
import { formatTime } from "@/lib/format-time";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];
const surahById = new Map<number, Surah>(surahs.map((s) => [s.id, s]));

/**
 * Gate a component on client mount so it reads persisted zustand state
 * only after hydration — otherwise SSR + hydration mismatch fires when
 * localStorage would flip a card from "hidden" to "visible".
 */
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Canonical "mount flag" pattern — the rule's escape hatch cases.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}

function ContinueListeningCard() {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const positionMs = usePlayerStore((s) => s.playback.positionMs);
  const play = usePlayerStore((s) => s.play);
  const track = tracks[currentIndex];

  if (!track) return null;

  return (
    <div className="group border-border bg-surface-raised hover:bg-accent duration-fast ease-standard relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 transition-colors">
      <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        {track.artwork ? (
          <Image
            src={track.artwork}
            alt={track.artist}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
          Continue listening
        </p>
        <p className="truncate text-sm font-semibold">{track.title}</p>
        <p className="text-muted-foreground truncate text-xs">
          {track.artist} · paused at {formatTime(positionMs)}
        </p>
      </div>
      <button
        onClick={() => void play()}
        className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong duration-fast ease-standard flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
      >
        <PlayIcon size={14} color="currentColor" />
        Resume
      </button>
    </div>
  );
}

function ContinueReadingCard() {
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);
  const lastSurahId = useReadingSettingsStore((s) => s.lastReadSurahId);
  const lastSurah = lastSurahId != null ? surahById.get(lastSurahId) : undefined;

  // Prefer a specific surah when one is recorded. Fall back to the
  // mushaf page. Show nothing on a truly fresh account.
  if (lastSurah) {
    return (
      <Link
        href={`/quran/${lastSurah.id}`}
        className="group relative flex items-center gap-4 overflow-hidden rounded-md border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
      >
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
            Continue reading
          </p>
          <p className="truncate text-sm font-semibold">Surah {lastSurah.name}</p>
          <p className="text-muted-foreground truncate text-xs">
            {lastSurah.translated_name_english} · {lastSurah.verses_count} verses
          </p>
        </div>
      </Link>
    );
  }

  if (mushafPage <= 1) return null;

  return (
    <Link
      href="/quran"
      className="group border-border bg-surface-raised hover:bg-accent duration-fast ease-standard relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 transition-colors"
    >
      <div className="text-muted-foreground bg-background flex h-16 w-16 shrink-0 items-center justify-center rounded-lg">
        <QuranIcon size={28} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
          Continue reading
        </p>
        <p className="truncate text-sm font-semibold">Mushaf page {mushafPage}</p>
        <p className="text-muted-foreground truncate text-xs">Tap to pick up where you stopped</p>
      </div>
    </Link>
  );
}

export function ContinueWhereYouLeftOff() {
  const mounted = useMounted();
  const hasListening = usePlayerStore(
    (s) => s.queue.currentIndex >= 0 && s.queue.tracks.length > 0,
  );
  const hasReading = useReadingSettingsStore((s) => s.lastReadSurahId !== null || s.mushafPage > 1);

  if (!mounted) return null;
  if (!hasListening && !hasReading) return null;

  return (
    <section className="mb-8 grid gap-3 sm:grid-cols-2">
      {hasListening ? <ContinueListeningCard /> : null}
      {hasReading ? <ContinueReadingCard /> : null}
    </section>
  );
}
