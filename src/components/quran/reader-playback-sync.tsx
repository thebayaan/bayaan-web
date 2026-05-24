"use client";

import { useEffect, useRef } from "react";
import { useTimestampLoader } from "@/hooks/use-timestamp-loader";
import { useAyahTracker } from "@/hooks/use-ayah-tracker";
import { useAyahTrackerStore } from "@/stores/ayah-tracker-store";
import { usePlayerStore } from "@/stores/player-store";

interface ReaderPlaybackSyncProps {
  surahId: number;
  /** Scroll container for mushaf mode; reading view scrolls the window. */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Keeps ayah timestamps loaded and the active ayah highlight in sync
 * with the bottom player while the user reads Quran content.
 */
export function ReaderPlaybackSync({ surahId, scrollContainerRef }: ReaderPlaybackSyncProps) {
  useTimestampLoader();
  useAyahTracker();

  const activeVerseKey = useAyahTrackerStore((s) => s.activeVerseKey);
  const trackedSurahId = useAyahTrackerStore((s) => s.trackedSurahId);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const lastScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPlaying || !activeVerseKey || trackedSurahId !== surahId) {
      lastScrolledRef.current = null;
      return;
    }
    if (lastScrolledRef.current === activeVerseKey) return;

    if (scrollContainerRef?.current) {
      // Mushaf view handles page-level follow-scroll itself.
      lastScrolledRef.current = activeVerseKey;
      return;
    }

    const node = document.getElementById(activeVerseKey);
    if (!node) return;

    lastScrolledRef.current = activeVerseKey;

    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeVerseKey, trackedSurahId, surahId, isPlaying, scrollContainerRef]);

  return null;
}
