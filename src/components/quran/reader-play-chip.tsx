"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/stores/player-store";
import { useReaderPlayerStore } from "@/stores/reader-player-store";
import { createTrack } from "@/lib/audio-utils";
import { PlayIcon } from "@/components/icons";
import type { Reciter, Rewayat } from "@/types/reciter";

interface ReaderPlayChipProps {
  surahId: number;
  surahName: string;
}

interface ResolvedReciter {
  reciter: Reciter;
  rewayat: Rewayat;
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
            <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
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
        surahName={surahName}
        reciters={availableReciters}
        selectedId={resolved?.reciter.id ?? null}
        onPick={handlePick}
      />
    </>
  );
}

interface ReciterPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahName: string;
  reciters: ResolvedReciter[];
  selectedId: string | null;
  onPick: (choice: ResolvedReciter) => void;
}

function ReciterPickerDialog({
  open,
  onOpenChange,
  surahName,
  reciters,
  selectedId,
  onPick,
}: ReciterPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogTitle>Choose a reciter</DialogTitle>
        <DialogDescription className="mb-3">
          Pick a reciter to play Surah {surahName}. Your choice is remembered.
        </DialogDescription>
        <ul className="max-h-80 space-y-1 overflow-y-auto" aria-label="Available reciters">
          {reciters.map(({ reciter, rewayat }) => {
            const selected = reciter.id === selectedId;
            return (
              <li key={reciter.id}>
                <button
                  type="button"
                  onClick={() => onPick({ reciter, rewayat })}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--text-alpha-06)] ${
                    selected ? "bg-brand-light" : ""
                  }`}
                >
                  <span className="bg-muted h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    {reciter.image_url ? (
                      <Image
                        src={reciter.image_url}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{reciter.name}</span>
                    <span className="text-muted-foreground block truncate text-xs capitalize">
                      {rewayat.style} · {rewayat.name}
                    </span>
                  </span>
                  {selected ? (
                    <span className="text-brand-main shrink-0 text-xs font-semibold">Current</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
