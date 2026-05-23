"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { useReciters } from "@/hooks/use-reciters";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";
import { VolumeControl } from "./volume-control";
import { FullPlayerView } from "./full-player-view";
import { QueuePanel } from "./queue-panel";
import { audioService } from "@/services/audio/audio-service";
import type { RepeatMode } from "@/types/audio";
import { useAudioEvents } from "@/hooks/use-audio-events";
import { useMediaSession } from "@/hooks/use-media-session";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useSleepTimer } from "@/hooks/use-sleep-timer";
import { SleepTimerMenu } from "./sleep-timer-menu";
import { useRecentlyPlayedTracker } from "@/hooks/use-recently-played-tracker";
import { HeartToggle } from "./heart-toggle";
import { NowPlayingMenu } from "./now-playing-menu";

export function BottomPlayerBar() {
  useAudioEvents();
  useMediaSession();
  useWakeLock();
  const { remainingMs: sleepTimerRemainingMs } = useSleepTimer();
  useRecentlyPlayedTracker();
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const playback = usePlayerStore((s) => s.playback);
  const settings = usePlayerStore((s) => s.settings);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const skipToPrevious = usePlayerStore((s) => s.skipToPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const setRate = usePlayerStore((s) => s.setRate);

  const currentTrack = tracks[currentIndex];
  const { reciters } = useReciters();
  const currentReciter = currentTrack
    ? reciters.find((r) => r.id === currentTrack.reciterId)
    : undefined;
  const reciterSlug = currentReciter?.slug;
  const rewayahName = currentReciter?.rewayat.find((rw) => rw.id === currentTrack?.rewayatId)?.name;
  const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

  const cycleRate = (): void => {
    const idx = PLAYBACK_RATES.indexOf(settings.rate as (typeof PLAYBACK_RATES)[number]);
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length]!;
    setRate(next);
  };

  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) {
    return (
      <footer
        data-player-hidden={false}
        className="border-border bg-background/80 duration-regular ease-standard flex h-20 items-center justify-center border-t px-4 backdrop-blur-2xl transition-transform data-[player-hidden=true]:translate-y-full"
      >
        <p className="text-muted-foreground text-sm">Select a reciter to start listening</p>
      </footer>
    );
  }

  const handlePlayPause = (): void => {
    if (playback.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const cycleRepeat = (): void => {
    const modes: RepeatMode[] = ["none", "queue", "track"];
    const currentIdx = modes.indexOf(settings.repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length]!;
    setRepeatMode(nextMode);
  };

  const handleVolumeChange = (vol: number): void => {
    audioService.setVolume(vol);
    usePlayerStore.getState().updatePlayback({ volume: vol, isMuted: false });
  };

  const handleMuteToggle = (): void => {
    const newMuted = !playback.isMuted;
    audioService.setMuted(newMuted);
    usePlayerStore.getState().updatePlayback({ isMuted: newMuted });
  };

  return (
    <footer
      data-player-hidden={false}
      className="border-border bg-background/80 duration-regular ease-standard flex h-20 min-w-0 items-center gap-2 border-t px-2 backdrop-blur-2xl transition-transform data-[player-hidden=true]:translate-y-full sm:gap-4 sm:px-4"
    >
      {/* Track Info — Left. Title + artwork open the full player; the
          artist link jumps to the reciter page so it still works even
          when the rest of the row is acting as a big button. */}
      <div className="flex min-w-0 shrink items-center gap-2 sm:w-[240px] sm:gap-3">
        <button
          onClick={() => setShowFullPlayer(true)}
          className="bg-muted hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg sm:block"
          aria-label="Open full player"
        >
          {currentTrack.artwork && (
            <Image
              src={currentTrack.artwork}
              alt={currentTrack.title}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          )}
        </button>
        <div className="min-w-0">
          <button
            onClick={() => setShowFullPlayer(true)}
            className="block w-full min-w-0 truncate text-left text-sm font-medium hover:underline"
          >
            {currentTrack.title}
          </button>
          <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
            {reciterSlug ? (
              <Link href={`/reciter/${reciterSlug}`} className="min-w-0 truncate hover:underline">
                {currentTrack.artist}
              </Link>
            ) : (
              <span className="min-w-0 truncate">{currentTrack.artist}</span>
            )}
            {rewayahName ? (
              <>
                <span aria-hidden className="hidden shrink-0 opacity-50 sm:inline">
                  ·
                </span>
                <span className="hidden shrink-0 capitalize sm:inline">{rewayahName}</span>
              </>
            ) : null}
          </div>
        </div>
        <HeartToggle
          target={{
            reciter_id: currentTrack.reciterId,
            rewayat_id: currentTrack.rewayatId,
            surah_id: currentTrack.surahId,
          }}
          trackTitle={currentTrack.title}
          className="text-muted-foreground hover:text-foreground aria-pressed:text-brand-main hidden shrink-0 rounded-full p-1.5 transition-colors hover:bg-[var(--text-alpha-10)] sm:block"
        />
        <NowPlayingMenu
          track={currentTrack}
          reciterSlug={reciterSlug}
          className="text-muted-foreground hover:text-foreground hidden shrink-0 rounded-full p-1.5 transition-colors hover:bg-[var(--text-alpha-10)] sm:block"
        />
      </div>

      {/* Controls + Progress — Center */}
      <div className="flex max-w-[600px] min-w-0 flex-1 flex-col items-center gap-1">
        <PlayerControls
          isPlaying={playback.isPlaying}
          onPlayPause={handlePlayPause}
          onNext={skipToNext}
          onPrevious={skipToPrevious}
          repeatMode={settings.repeatMode}
          onRepeatChange={cycleRepeat}
          shuffle={settings.shuffle}
          onShuffleToggle={toggleShuffle}
        />
        <ProgressBar
          positionMs={playback.positionMs}
          durationMs={playback.durationMs}
          onSeek={seekTo}
        />
      </div>

      {/* Volume + Queue Toggle — Right */}
      <div className="hidden items-center justify-end gap-2 sm:flex sm:w-[200px]">
        <button
          onClick={() => setShowQueue(!showQueue)}
          className="text-muted-foreground hover:text-foreground p-2 transition-colors"
          aria-label="Toggle queue"
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={cycleRate}
          aria-label={`Playback rate ${settings.rate}x`}
          className="hover:bg-surface-raised duration-fast ease-standard min-w-[44px] rounded-md px-2 py-1 text-xs font-semibold tabular-nums transition-colors"
        >
          {settings.rate}x
        </button>
        <SleepTimerMenu remainingMs={sleepTimerRemainingMs} />
        <VolumeControl
          volume={playback.volume}
          isMuted={playback.isMuted}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
        />
      </div>
      <FullPlayerView open={showFullPlayer} onOpenChange={setShowFullPlayer} />
      <QueuePanel open={showQueue} onOpenChange={setShowQueue} />
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {playback.isPlaying ? "Playing" : "Paused"}: {currentTrack.title} by {currentTrack.artist}
      </div>
    </footer>
  );
}
