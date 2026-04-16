"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePlayerStore } from "@/stores/player-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { PlayIcon, QuranIcon } from "@/components/icons";

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

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
    <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]">
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
        className="bg-foreground text-background flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105"
      >
        <PlayIcon size={14} color="currentColor" />
        Resume
      </button>
    </div>
  );
}

function ContinueReadingCard() {
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);
  if (mushafPage <= 1) return null;

  return (
    <Link
      href="/quran"
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
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
  const hasReading = useReadingSettingsStore((s) => s.mushafPage > 1);

  if (!mounted) return null;
  if (!hasListening && !hasReading) return null;

  return (
    <section className="mb-8 grid gap-3 sm:grid-cols-2">
      {hasListening ? <ContinueListeningCard /> : null}
      {hasReading ? <ContinueReadingCard /> : null}
    </section>
  );
}
