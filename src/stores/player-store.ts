import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Track,
  RepeatMode,
  PlaybackState,
  PlayerSettings,
} from "@/types/audio";
import { audioService } from "@/services/audio/audio-service";
import { audioCoordinator } from "@/services/audio/audio-coordinator";

interface QueueState {
  tracks: Track[];
  currentIndex: number;
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

  // Playback actions
  play: () => Promise<void>;
  pause: () => void;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
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
};

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set, get) => ({
      queue: { tracks: [], currentIndex: -1 },
      playback: { ...INITIAL_PLAYBACK },
      settings: { ...INITIAL_SETTINGS },
      isLoading: false,

      updateQueue: async (tracks, startIndex = 0) => {
        set({
          queue: { tracks, currentIndex: startIndex },
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
          const removedBefore = indices.filter(
            (i) => i < s.queue.currentIndex,
          ).length;
          currentIndex -= removedBefore;

          if (currentIndex >= tracks.length) {
            currentIndex = Math.max(0, tracks.length - 1);
          }

          return { queue: { tracks, currentIndex } };
        });
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

          return { queue: { tracks, currentIndex } };
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
        const { tracks, currentIndex } = state.queue;
        let nextIndex = currentIndex + 1;

        if (state.settings.repeatMode === "track") {
          nextIndex = currentIndex;
        } else if (nextIndex >= tracks.length) {
          if (state.settings.repeatMode === "queue") {
            nextIndex = 0;
          } else {
            audioService.pause();
            audioCoordinator.sourceDidStop("main");
            set((s) => ({ playback: { ...s.playback, isPlaying: false } }));
            return;
          }
        }

        const nextTrack = tracks[nextIndex];
        if (nextTrack) {
          set((s) => ({
            queue: { ...s.queue, currentIndex: nextIndex },
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
        const { tracks, currentIndex } = state.queue;

        // If more than 3 seconds in, restart current track
        if (state.playback.positionMs > 3000) {
          audioService.seek(0);
          set((s) => ({ playback: { ...s.playback, positionMs: 0 } }));
          return;
        }

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          if (state.settings.repeatMode === "queue") {
            prevIndex = tracks.length - 1;
          } else {
            audioService.seek(0);
            set((s) => ({ playback: { ...s.playback, positionMs: 0 } }));
            return;
          }
        }

        const prevTrack = tracks[prevIndex];
        if (prevTrack) {
          set((s) => ({
            queue: { ...s.queue, currentIndex: prevIndex },
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

      seekTo: (positionMs) => {
        audioService.seek(positionMs / 1000);
        set((s) => ({ playback: { ...s.playback, positionMs } }));
      },

      setRepeatMode: (mode) => {
        set((s) => ({ settings: { ...s.settings, repeatMode: mode } }));
      },

      toggleShuffle: () => {
        set((s) => ({
          settings: { ...s.settings, shuffle: !s.settings.shuffle },
        }));
      },

      setSleepTimer: (minutes) => {
        set((s) => ({
          settings: { ...s.settings, sleepTimerMinutes: minutes },
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
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Discard stale URLs (non-cdn.thebayaan.com)
        const hasBadUrls = state.queue.tracks.some(
          (t) =>
            t.url.includes("mp3quran.net") || t.url.includes("supabase.co"),
        );
        if (hasBadUrls) {
          state.queue = { tracks: [], currentIndex: -1 };
        }
      },
    },
  ),
);
