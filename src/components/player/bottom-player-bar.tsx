"use client";

import Image from "next/image";
import { useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";
import { VolumeControl } from "./volume-control";
import { FullPlayerView } from "./full-player-view";
import { QueuePanel } from "./queue-panel";
import { audioService } from "@/services/audio/audio-service";
import type { RepeatMode } from "@/types/audio";
import { useAudioEvents } from "@/hooks/use-audio-events";
import { useMediaSession } from "@/hooks/use-media-session";

export function BottomPlayerBar() {
  useAudioEvents();
  useMediaSession();
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

  const currentTrack = tracks[currentIndex];

  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) {
    return (
      <footer className="border-border bg-background/80 flex h-20 items-center justify-center border-t px-4 backdrop-blur-2xl">
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
    <footer className="border-border bg-background/80 flex h-20 items-center gap-4 border-t px-4 backdrop-blur-2xl">
      {/* Track Info — Left */}
      <button
        onClick={() => setShowFullPlayer(true)}
        className="flex w-[240px] min-w-0 items-center gap-3 text-left"
        aria-label="Open full player"
      >
        <div className="bg-muted h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          {currentTrack.artwork && (
            <Image
              src={currentTrack.artwork}
              alt={currentTrack.title}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{currentTrack.title}</p>
          <p className="text-muted-foreground truncate text-xs">{currentTrack.artist}</p>
        </div>
      </button>

      {/* Controls + Progress — Center */}
      <div className="flex max-w-[600px] flex-1 flex-col items-center gap-1">
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
      <div className="flex w-[200px] items-center justify-end gap-2">
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
        <VolumeControl
          volume={playback.volume}
          isMuted={playback.isMuted}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
        />
      </div>
      <FullPlayerView open={showFullPlayer} onOpenChange={setShowFullPlayer} />
      <QueuePanel open={showQueue} onOpenChange={setShowQueue} />
    </footer>
  );
}
