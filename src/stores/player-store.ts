import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track, RepeatMode, PlaybackState, PlayerSettings } from "@/types/audio";
import { audioService } from "@/services/audio/audio-service";
import { audioCoordinator } from "@/services/audio/audio-coordinator";

interface QueueState {
  tracks: Track[];
  currentIndex: number;
  // Shuffle permutation. When non-null, skipToNext/Previous walk it
  // instead of sequential order. shuffleOrder[shufflePosition] always
  // equals currentIndex.
  shuffleOrder: number[] | null;
  shufflePosition: number;
}

/**
 * Fisher-Yates shuffle that returns a fresh array. Pass an optional
 * `pinFirst` index to ensure that value ends up at position 0 of the
 * result — used so the currently playing track stays "up next = 0".
 */
export function shuffleIndices(length: number, pinFirst?: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  if (pinFirst !== undefined && pinFirst >= 0 && pinFirst < length) {
    [indices[0], indices[pinFirst]] = [indices[pinFirst]!, indices[0]!];
  }
  // Shuffle the tail (keep index 0 pinned).
  for (let i = length - 1; i > 1; i--) {
    const j = 1 + Math.floor(Math.random() * i);
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices;
}

interface PlayerStoreState {
  queue: QueueState;
  playback: PlaybackState;
  settings: PlayerSettings;
  isLoading: boolean;

  // Queue actions
  updateQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
  addToQueue: (tracks: Track[]) => Promise<void>;
  removeFromQueue: (indices: number[]) => void;
  moveInQueue: (from: number, to: number) => void;
  clearQueue: () => void;

  // Playback actions
  play: () => Promise<void>;
  pause: () => void;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  skipToIndex: (index: number) => Promise<void>;
  seekTo: (positionMs: number) => void;

  // Settings actions
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setSleepTimer: (minutes: number | null) => void;
  setRate: (rate: number) => void;

  // State updates (called from audio event listeners)
  updatePlayback: (partial: Partial<PlaybackState>) => void;
  reset: () => void;
}

const INITIAL_PLAYBACK: PlaybackState = {
  isPlaying: false,
  currentTrackIndex: -1,
  positionMs: 0,
  durationMs: 0,
  rate: 1,
  volume: 1,
  isMuted: false,
};

const INITIAL_SETTINGS: PlayerSettings = {
  repeatMode: "none",
  shuffle: false,
  rate: 1,
  sleepTimerMinutes: null,
  sleepTimerEndsAt: null,
};

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set, get) => ({
      queue: { tracks: [], currentIndex: -1, shuffleOrder: null, shufflePosition: 0 },
      playback: { ...INITIAL_PLAYBACK },
      settings: { ...INITIAL_SETTINGS },
      isLoading: false,

      updateQueue: async (tracks, startIndex = 0) => {
        const { shuffle } = get().settings;
        const shuffleOrder = shuffle ? shuffleIndices(tracks.length, startIndex) : null;
        set({
          queue: {
            tracks,
            currentIndex: startIndex,
            shuffleOrder,
            shufflePosition: 0,
          },
          isLoading: true,
        });
        const track = tracks[startIndex];
        if (track) {
          audioService.load(track.url);
          audioCoordinator.mainWillPlay();
          await audioService.play();
          set((s) => ({
            playback: { ...s.playback, isPlaying: true },
            isLoading: false,
          }));
        }
      },

      addToQueue: async (newTracks) => {
        set((s) => ({
          queue: {
            ...s.queue,
            tracks: [...s.queue.tracks, ...newTracks],
          },
        }));
      },

      removeFromQueue: (indices) => {
        set((s) => {
          const indexSet = new Set(indices);
          const tracks = s.queue.tracks.filter((_, i) => !indexSet.has(i));
          let currentIndex = s.queue.currentIndex;

          // Adjust currentIndex for removed items before it
          const removedBefore = indices.filter((i) => i < s.queue.currentIndex).length;
          currentIndex -= removedBefore;

          if (currentIndex >= tracks.length) {
            currentIndex = Math.max(0, tracks.length - 1);
          }

          // Mutating the queue invalidates the shuffle permutation; rebuild
          // lazily on the next toggleShuffle or updateQueue.
          return {
            queue: {
              tracks,
              currentIndex,
              shuffleOrder: null,
              shufflePosition: 0,
            },
          };
        });
      },

      clearQueue: () => {
        audioService.cleanup();
        audioCoordinator.sourceDidStop("main");
        set((s) => ({
          queue: { tracks: [], currentIndex: -1, shuffleOrder: null, shufflePosition: 0 },
          playback: { ...s.playback, isPlaying: false, positionMs: 0, durationMs: 0 },
        }));
      },

      moveInQueue: (from, to) => {
        set((s) => {
          const tracks = [...s.queue.tracks];
          const [moved] = tracks.splice(from, 1);
          if (!moved) return s;
          tracks.splice(to, 0, moved);

          let currentIndex = s.queue.currentIndex;
          if (currentIndex === from) {
            currentIndex = to;
          } else if (from < currentIndex && to >= currentIndex) {
            currentIndex--;
          } else if (from > currentIndex && to <= currentIndex) {
            currentIndex++;
          }

          return {
            queue: {
              tracks,
              currentIndex,
              shuffleOrder: null,
              shufflePosition: 0,
            },
          };
        });
      },

      play: async () => {
        audioCoordinator.mainWillPlay();
        await audioService.play();
        set((s) => ({ playback: { ...s.playback, isPlaying: true } }));
      },

      pause: () => {
        audioService.pause();
        set((s) => ({ playback: { ...s.playback, isPlaying: false } }));
      },

      skipToNext: async () => {
        const state = get();
        const { tracks, currentIndex, shuffleOrder, shufflePosition } = state.queue;

        let nextIndex = currentIndex;
        let nextShufflePosition = shufflePosition;
        let nextShuffleOrder: number[] | null = shuffleOrder;

        if (state.settings.repeatMode === "track") {
          nextIndex = currentIndex;
        } else if (shuffleOrder) {
          nextShufflePosition = shufflePosition + 1;
          if (nextShufflePosition >= shuffleOrder.length) {
            if (state.settings.repeatMode === "queue") {
              // Re-shuffle pinning currentIndex so we don't immediately
              // repeat the last-played track.
              nextShuffleOrder = shuffleIndices(tracks.length, currentIndex);
              nextShufflePosition = 1;
            } else {
              audioService.pause();
              audioCoordinator.sourceDidStop("main");
              set((s) => ({ playback: { ...s.playback, isPlaying: false } }));
              return;
            }
          }
          nextIndex = nextShuffleOrder![nextShufflePosition]!;
        } else {
          nextIndex = currentIndex + 1;
          if (nextIndex >= tracks.length) {
            if (state.settings.repeatMode === "queue") {
              nextIndex = 0;
            } else {
              audioService.pause();
              audioCoordinator.sourceDidStop("main");
              set((s) => ({ playback: { ...s.playback, isPlaying: false } }));
              return;
            }
          }
        }

        const nextTrack = tracks[nextIndex];
        if (nextTrack) {
          set((s) => ({
            queue: {
              ...s.queue,
              currentIndex: nextIndex,
              shuffleOrder: nextShuffleOrder,
              shufflePosition: nextShufflePosition,
            },
            isLoading: true,
          }));
          audioService.load(nextTrack.url);
          audioCoordinator.mainWillPlay();
          await audioService.play();
          set((s) => ({
            playback: { ...s.playback, isPlaying: true, positionMs: 0 },
            isLoading: false,
          }));
        }
      },

      skipToPrevious: async () => {
        const state = get();
        const { tracks, currentIndex, shuffleOrder, shufflePosition } = state.queue;

        // If more than 3 seconds in, restart current track
        if (state.playback.positionMs > 3000) {
          audioService.seek(0);
          set((s) => ({ playback: { ...s.playback, positionMs: 0 } }));
          return;
        }

        let prevIndex = currentIndex;
        let prevShufflePosition = shufflePosition;

        if (shuffleOrder) {
          prevShufflePosition = shufflePosition - 1;
          if (prevShufflePosition < 0) {
            if (state.settings.repeatMode === "queue") {
              prevShufflePosition = shuffleOrder.length - 1;
            } else {
              audioService.seek(0);
              set((s) => ({ playback: { ...s.playback, positionMs: 0 } }));
              return;
            }
          }
          prevIndex = shuffleOrder[prevShufflePosition]!;
        } else {
          prevIndex = currentIndex - 1;
          if (prevIndex < 0) {
            if (state.settings.repeatMode === "queue") {
              prevIndex = tracks.length - 1;
            } else {
              audioService.seek(0);
              set((s) => ({ playback: { ...s.playback, positionMs: 0 } }));
              return;
            }
          }
        }

        const prevTrack = tracks[prevIndex];
        if (prevTrack) {
          set((s) => ({
            queue: {
              ...s.queue,
              currentIndex: prevIndex,
              shufflePosition: prevShufflePosition,
            },
            isLoading: true,
          }));
          audioService.load(prevTrack.url);
          audioCoordinator.mainWillPlay();
          await audioService.play();
          set((s) => ({
            playback: { ...s.playback, isPlaying: true, positionMs: 0 },
            isLoading: false,
          }));
        }
      },

      skipToIndex: async (index) => {
        const state = get();
        const { tracks, shuffleOrder } = state.queue;
        if (index < 0 || index >= tracks.length) return;
        const target = tracks[index];
        if (!target) return;

        // Re-sync shuffle position so subsequent next/prev align with the
        // new currentIndex without rebuilding the permutation.
        const nextShufflePosition = shuffleOrder ? Math.max(0, shuffleOrder.indexOf(index)) : 0;

        set((s) => ({
          queue: {
            ...s.queue,
            currentIndex: index,
            shufflePosition: nextShufflePosition,
          },
          isLoading: true,
        }));
        audioService.load(target.url);
        audioCoordinator.mainWillPlay();
        await audioService.play();
        set((s) => ({
          playback: { ...s.playback, isPlaying: true, positionMs: 0 },
          isLoading: false,
        }));
      },

      seekTo: (positionMs) => {
        audioService.seek(positionMs / 1000);
        set((s) => ({ playback: { ...s.playback, positionMs } }));
      },

      setRepeatMode: (mode) => {
        set((s) => ({ settings: { ...s.settings, repeatMode: mode } }));
      },

      toggleShuffle: () => {
        set((s) => {
          const nextShuffle = !s.settings.shuffle;
          if (!nextShuffle) {
            return {
              settings: { ...s.settings, shuffle: false },
              queue: { ...s.queue, shuffleOrder: null, shufflePosition: 0 },
            };
          }
          const order = shuffleIndices(s.queue.tracks.length, s.queue.currentIndex);
          return {
            settings: { ...s.settings, shuffle: true },
            queue: { ...s.queue, shuffleOrder: order, shufflePosition: 0 },
          };
        });
      },

      setSleepTimer: (minutes) => {
        const endsAt = minutes === null ? null : Date.now() + minutes * 60_000;
        set((s) => ({
          settings: { ...s.settings, sleepTimerMinutes: minutes, sleepTimerEndsAt: endsAt },
        }));
      },

      setRate: (rate) => {
        audioService.setRate(rate);
        set((s) => ({
          playback: { ...s.playback, rate },
          settings: { ...s.settings, rate },
        }));
      },

      updatePlayback: (partial) => {
        set((s) => ({ playback: { ...s.playback, ...partial } }));
      },

      reset: () => {
        audioService.cleanup();
        audioCoordinator.sourceDidStop("main");
        set(usePlayerStore.getInitialState());
      },
    }),
    {
      name: "bayaan-player",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queue: state.queue,
        playback: {
          ...state.playback,
          isPlaying: false,
          positionMs: state.playback.positionMs,
        },
        settings: {
          ...state.settings,
          sleepTimerMinutes: null,
          sleepTimerEndsAt: null,
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Discard stale URLs (non-cdn.thebayaan.com)
        const hasBadUrls = state.queue.tracks.some(
          (t) => t.url.includes("mp3quran.net") || t.url.includes("supabase.co"),
        );
        if (hasBadUrls) {
          state.queue = { tracks: [], currentIndex: -1, shuffleOrder: null, shufflePosition: 0 };
        }
        // Back-compat: older persisted state may not have shuffle fields.
        if (state.queue.shuffleOrder === undefined) {
          state.queue.shuffleOrder = null;
          state.queue.shufflePosition = 0;
        }
      },
    },
  ),
);
