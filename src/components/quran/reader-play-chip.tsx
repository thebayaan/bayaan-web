"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/stores/player-store";
import { useReaderPlayerStore } from "@/stores/reader-player-store";
import { createTrack } from "@/lib/audio-utils";
import { PauseIcon, PlayIcon } from "@/components/icons";
import {
  ReciterPickerDialog,
  type ResolvedReciter,
} from "@/components/quran/reciter-picker-dialog";

interface ReaderPlayChipProps {
  surahId: number;
  surahName: string;
}

export function ReaderPlayChip({ surahId, surahName }: ReaderPlayChipProps) {
  const { reciters, isLoading } = useReciters();
  const lastReciterId = useReaderPlayerStore((s) => s.lastReciterId);
  const lastRewayatId = useReaderPlayerStore((s) => s.lastRewayatId);
  const setLastReciter = useReaderPlayerStore((s) => s.setLastReciter);

  const updateQueue = usePlayerStore((s) => s.updateQueue);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const currentTrack = usePlayerStore((s) => {
    const tracks = s.queue.tracks;
    return tracks[s.queue.currentIndex];
  });

  const [pickerOpen, setPickerOpen] = useState(false);

  // Reciters that have this surah available. We list these in the picker
  // and fall back to the first match if the persisted reciter isn't in
  // the catalogue for this surah.
  const availableReciters = useMemo<ResolvedReciter[]>(() => {
    return reciters
      .map((r) => {
        const rw = r.rewayat.find((rwy) => rwy.surah_list.includes(surahId));
        return rw ? { reciter: r, rewayat: rw } : null;
      })
      .filter((x): x is ResolvedReciter => x !== null);
  }, [reciters, surahId]);

  const resolved = useMemo<ResolvedReciter | null>(() => {
    if (!lastReciterId || availableReciters.length === 0) return null;
    return (
      availableReciters.find(
        (a) =>
          a.reciter.id === lastReciterId &&
          (lastRewayatId === null || a.rewayat.id === lastRewayatId),
      ) ?? null
    );
  }, [availableReciters, lastReciterId, lastRewayatId]);

  const isThisTrackPlaying =
    resolved !== null &&
    currentTrack?.reciterId === resolved.reciter.id &&
    currentTrack?.surahId === surahId &&
    currentTrack?.rewayatId === resolved.rewayat.id &&
    isPlaying;

  function startPlayback({ reciter, rewayat }: ResolvedReciter): void {
    const track = createTrack(reciter, rewayat, surahId, surahName);
    void updateQueue([track]);
    setLastReciter(reciter.id, rewayat.id);
  }

  function handlePlayPause(): void {
    if (!resolved) {
      setPickerOpen(true);
      return;
    }
    // Already loaded this exact recording — just toggle.
    if (
      currentTrack?.reciterId === resolved.reciter.id &&
      currentTrack?.surahId === surahId &&
      currentTrack?.rewayatId === resolved.rewayat.id
    ) {
      if (isPlaying) {
        pause();
      } else {
        void play();
      }
      return;
    }
    startPlayback(resolved);
  }

  function handlePick(choice: ResolvedReciter): void {
    setPickerOpen(false);
    startPlayback(choice);
  }

  if (isLoading) {
    return (
      <div aria-hidden="true" className="bg-surface-sunken h-9 w-32 animate-pulse rounded-full" />
    );
  }
  if (availableReciters.length === 0) return null;

  return (
    <>
      <div className="border-border bg-surface inline-flex items-center gap-1 rounded-full border p-1">
        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={
            !resolved
              ? "Pick a reciter to play"
              : isThisTrackPlaying
                ? `Pause ${resolved.reciter.name}`
                : `Play ${surahName} by ${resolved.reciter.name}`
          }
          className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong duration-fast ease-standard flex h-7 w-7 items-center justify-center rounded-full transition-colors"
        >
          {isThisTrackPlaying ? (
            <PauseIcon size={12} aria-hidden="true" />
          ) : (
            <PlayIcon size={12} color="currentColor" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          aria-label={
            resolved ? `Change reciter (currently ${resolved.reciter.name})` : "Choose reciter"
          }
          className="hover:bg-surface-raised flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors"
        >
          {resolved ? (
            <>
              <span className="bg-muted h-5 w-5 shrink-0 overflow-hidden rounded-full">
                {resolved.reciter.image_url ? (
                  <Image
                    src={resolved.reciter.image_url}
                    alt=""
                    width={20}
                    height={20}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <span className="max-w-[8rem] truncate">{resolved.reciter.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Choose reciter</span>
          )}
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-muted-foreground"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <ReciterPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        description={`Pick a reciter to play Surah ${surahName}. Your choice is remembered.`}
        reciters={availableReciters}
        selectedId={resolved?.reciter.id ?? null}
        onPick={handlePick}
      />
    </>
  );
}
