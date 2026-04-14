"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { audioService } from "@/services/audio/audio-service";

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const state = usePlayerStore.getState();

      switch (e.code) {
        case "Space": {
          e.preventDefault();
          if (state.playback.isPlaying) {
            state.pause();
          } else {
            state.play();
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const newPos = state.playback.positionMs + 10000;
          state.seekTo(Math.min(newPos, state.playback.durationMs));
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const newPos2 = state.playback.positionMs - 10000;
          state.seekTo(Math.max(newPos2, 0));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const vol = Math.min(1, audioService.getVolume() + 0.1);
          audioService.setVolume(vol);
          state.updatePlayback({ volume: vol });
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const vol2 = Math.max(0, audioService.getVolume() - 0.1);
          audioService.setVolume(vol2);
          state.updatePlayback({ volume: vol2 });
          break;
        }
        case "KeyM": {
          const muted = !audioService.getIsMuted();
          audioService.setMuted(muted);
          state.updatePlayback({ isMuted: muted });
          break;
        }
        case "KeyN": {
          state.skipToNext();
          break;
        }
        case "KeyP": {
          state.skipToPrevious();
          break;
        }
        case "Slash": {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="search"], input[placeholder*="Search"]',
          );
          searchInput?.focus();
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
