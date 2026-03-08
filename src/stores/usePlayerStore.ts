import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  UnifiedPlayerState,
  PlayerAction,
  PlayerState,
  RepeatMode,
  PlaybackState,
  QueueState,
  LoadingState,
  ErrorState,
  PlaybackSettings,
  UIState,
} from "@/types/player";
import type { Track } from "@/types/audio";

/* ─── Initial State ──────────────────────────────────────────────────────────── */

const initialPlayback: PlaybackState = {
  state: "none",
  position: 0,
  duration: 0,
  rate: 1.0,
  buffering: false,
};

const initialQueue: QueueState = {
  tracks: [],
  currentIndex: -1,
  loading: false,
  endReached: false,
  total: 0,
};

const initialLoading: LoadingState = {
  trackLoading: false,
  queueLoading: false,
  stateRestoring: false,
};

const initialError: ErrorState = {
  playback: null,
  queue: null,
  system: null,
};

const initialSettings: PlaybackSettings = {
  repeatMode: "none",
  shuffle: false,
  sleepTimer: 0,
  sleepTimerEnd: null,
  sleepTimerInterval: null,
  skipSilence: false,
};

const initialUI: UIState = {
  sheetMode: "hidden",
  isTransitioning: false,
  isImmersive: false,
};

const initialState: UnifiedPlayerState = {
  playback: initialPlayback,
  queue: initialQueue,
  loading: initialLoading,
  error: initialError,
  settings: initialSettings,
  ui: initialUI,
};

/* ─── Store Definition ───────────────────────────────────────────────────────── */

interface PlayerStore extends UnifiedPlayerState {
  // Actions
  dispatch: (action: PlayerAction) => void;

  // Track management
  loadTrack: (track: Track) => Promise<void>;
  loadQueue: (tracks: Track[], startIndex?: number) => Promise<void>;

  // Playback controls
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (position: number) => void;
  setPlaybackRate: (rate: number) => void;

  // Queue management
  addToQueue: (tracks: Track[]) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;

  // Settings
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setSleepTimer: (minutes: number) => void;
  clearSleepTimer: () => void;
  toggleSkipSilence: () => void;

  // UI
  setSheetMode: (mode: UIState["sheetMode"]) => void;
  toggleImmersive: () => void;

  // Internal state updates (called by AudioService)
  updatePlaybackState: (state: Partial<PlaybackState>) => void;
  setPlayerState: (state: PlayerState) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setBuffering: (buffering: boolean) => void;
  setError: (type: keyof ErrorState, error: Error | null) => void;

  // Getters
  getCurrentTrack: () => Track | null;
  hasNextTrack: () => boolean;
  hasPreviousTrack: () => boolean;
  getNextTrackIndex: () => number;
  getPreviousTrackIndex: () => number;
}

export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Action dispatcher
    dispatch: (action: PlayerAction) => {
      switch (action.type) {
        case "PLAY":
          get().play();
          break;
        case "PAUSE":
          get().pause();
          break;
        case "SKIP_NEXT":
          get().skipNext();
          break;
        case "SKIP_PREVIOUS":
          get().skipPrevious();
          break;
        case "SEEK":
          get().seekTo(action.payload);
          break;
        case "SET_RATE":
          get().setPlaybackRate(action.payload);
          break;
        case "SET_REPEAT_MODE":
          get().setRepeatMode(action.payload);
          break;
        case "TOGGLE_SHUFFLE":
          get().toggleShuffle();
          break;
        case "SET_SLEEP_TIMER":
          get().setSleepTimer(action.payload);
          break;
        case "TOGGLE_SKIP_SILENCE":
          get().toggleSkipSilence();
          break;
      }
    },

    // Track management
    loadTrack: async (track: Track) => {
      set((state) => ({
        loading: { ...state.loading, trackLoading: true },
        error: { ...state.error, playback: null },
      }));

      try {
        // Clear current queue and load single track
        const tracks = [track];
        await get().loadQueue(tracks, 0);
      } catch (error) {
        set((state) => ({
          loading: { ...state.loading, trackLoading: false },
          error: {
            ...state.error,
            playback: error instanceof Error ? error : new Error("Failed to load track"),
          },
        }));
        throw error;
      }
    },

    loadQueue: async (tracks: Track[], startIndex = 0) => {
      set((state) => ({
        loading: { ...state.loading, queueLoading: true },
        error: { ...state.error, queue: null },
      }));

      try {
        set((state) => ({
          queue: {
            ...state.queue,
            tracks,
            currentIndex: startIndex,
            total: tracks.length,
            endReached: false,
          },
          loading: { ...state.loading, queueLoading: false },
        }));

        // Load the current track if AudioService is available
        if (typeof window !== "undefined" && window.audioService) {
          const currentTrack = tracks[startIndex];
          if (currentTrack) {
            await window.audioService.loadTrack(currentTrack);
          }
        }
      } catch (error) {
        set((state) => ({
          loading: { ...state.loading, queueLoading: false },
          error: {
            ...state.error,
            queue: error instanceof Error ? error : new Error("Failed to load queue"),
          },
        }));
        throw error;
      }
    },

    // Playback controls
    play: async () => {
      const currentTrack = get().getCurrentTrack();

      if (!currentTrack) {
        throw new Error("No track to play");
      }

      if (typeof window !== "undefined" && window.audioService) {
        try {
          await window.audioService.play();
        } catch (error) {
          set((state) => ({
            error: {
              ...state.error,
              playback: error instanceof Error ? error : new Error("Playback failed"),
            },
          }));
          throw error;
        }
      }
    },

    pause: () => {
      if (typeof window !== "undefined" && window.audioService) {
        window.audioService.pause();
      }
    },

    stop: () => {
      if (typeof window !== "undefined" && window.audioService) {
        window.audioService.stop();
      }
      set((state) => ({
        playback: {
          ...state.playback,
          state: "stopped",
          position: 0,
        },
      }));
    },

    skipNext: async () => {
      const nextIndex = get().getNextTrackIndex();
      if (nextIndex === -1) return;

      set((state) => ({
        queue: { ...state.queue, currentIndex: nextIndex },
      }));

      const nextTrack = get().getCurrentTrack();
      if (nextTrack && typeof window !== "undefined" && window.audioService) {
        await window.audioService.loadTrack(nextTrack);
        if (get().playback.state === "playing") {
          await window.audioService.play();
        }
      }
    },

    skipPrevious: async () => {
      const previousIndex = get().getPreviousTrackIndex();
      if (previousIndex === -1) return;

      set((state) => ({
        queue: { ...state.queue, currentIndex: previousIndex },
      }));

      const previousTrack = get().getCurrentTrack();
      if (previousTrack && typeof window !== "undefined" && window.audioService) {
        await window.audioService.loadTrack(previousTrack);
        if (get().playback.state === "playing") {
          await window.audioService.play();
        }
      }
    },

    seekTo: (position: number) => {
      if (typeof window !== "undefined" && window.audioService) {
        window.audioService.seekTo(position);
      }
      set((state) => ({
        playback: { ...state.playback, position },
      }));
    },

    setPlaybackRate: (rate: number) => {
      if (typeof window !== "undefined" && window.audioService) {
        window.audioService.setPlaybackRate(rate);
      }
      set((state) => ({
        playback: { ...state.playback, rate },
      }));
    },

    // Queue management
    addToQueue: (tracks: Track[]) => {
      set((state) => ({
        queue: {
          ...state.queue,
          tracks: [...state.queue.tracks, ...tracks],
          total: state.queue.tracks.length + tracks.length,
        },
      }));
    },

    removeFromQueue: (index: number) => {
      set((state) => {
        const newTracks = [...state.queue.tracks];
        newTracks.splice(index, 1);

        let newCurrentIndex = state.queue.currentIndex;
        if (index < state.queue.currentIndex) {
          newCurrentIndex = state.queue.currentIndex - 1;
        } else if (index === state.queue.currentIndex) {
          newCurrentIndex = Math.min(newCurrentIndex, newTracks.length - 1);
        }

        return {
          queue: {
            ...state.queue,
            tracks: newTracks,
            currentIndex: newCurrentIndex,
            total: newTracks.length,
          },
        };
      });
    },

    reorderQueue: (fromIndex: number, toIndex: number) => {
      set((state) => {
        const newTracks = [...state.queue.tracks];
        const [movedTrack] = newTracks.splice(fromIndex, 1);
        newTracks.splice(toIndex, 0, movedTrack);

        let newCurrentIndex = state.queue.currentIndex;
        if (fromIndex === state.queue.currentIndex) {
          newCurrentIndex = toIndex;
        } else if (
          fromIndex < state.queue.currentIndex &&
          toIndex >= state.queue.currentIndex
        ) {
          newCurrentIndex = state.queue.currentIndex - 1;
        } else if (
          fromIndex > state.queue.currentIndex &&
          toIndex <= state.queue.currentIndex
        ) {
          newCurrentIndex = state.queue.currentIndex + 1;
        }

        return {
          queue: {
            ...state.queue,
            tracks: newTracks,
            currentIndex: newCurrentIndex,
          },
        };
      });
    },

    clearQueue: () => {
      get().stop();
      set(() => ({
        queue: initialQueue,
        playback: initialPlayback,
      }));
    },

    // Settings
    setRepeatMode: (mode: RepeatMode) => {
      set((state) => ({
        settings: { ...state.settings, repeatMode: mode },
      }));
    },

    toggleShuffle: () => {
      set((state) => ({
        settings: { ...state.settings, shuffle: !state.settings.shuffle },
      }));
    },

    setSleepTimer: (minutes: number) => {
      const { settings } = get();

      // Clear existing timer
      if (settings.sleepTimerInterval) {
        clearInterval(settings.sleepTimerInterval);
      }

      if (minutes <= 0) {
        set((state) => ({
          settings: {
            ...state.settings,
            sleepTimer: 0,
            sleepTimerEnd: null,
            sleepTimerInterval: null,
          },
        }));
        return;
      }

      const endTime = Date.now() + minutes * 60 * 1000;
      const interval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          get().pause();
          get().clearSleepTimer();
        }
      }, 1000);

      set((state) => ({
        settings: {
          ...state.settings,
          sleepTimer: minutes,
          sleepTimerEnd: endTime,
          sleepTimerInterval: interval,
        },
      }));
    },

    clearSleepTimer: () => {
      const { settings } = get();
      if (settings.sleepTimerInterval) {
        clearInterval(settings.sleepTimerInterval);
      }
      set((state) => ({
        settings: {
          ...state.settings,
          sleepTimer: 0,
          sleepTimerEnd: null,
          sleepTimerInterval: null,
        },
      }));
    },

    toggleSkipSilence: () => {
      set((state) => ({
        settings: { ...state.settings, skipSilence: !state.settings.skipSilence },
      }));
    },

    // UI
    setSheetMode: (mode: UIState["sheetMode"]) => {
      set((state) => ({
        ui: { ...state.ui, sheetMode: mode },
      }));
    },

    toggleImmersive: () => {
      set((state) => ({
        ui: { ...state.ui, isImmersive: !state.ui.isImmersive },
      }));
    },

    // Internal state updates
    updatePlaybackState: (newState: Partial<PlaybackState>) => {
      set((state) => ({
        playback: { ...state.playback, ...newState },
      }));
    },

    setPlayerState: (state: PlayerState) => {
      set((storeState) => ({
        playback: { ...storeState.playback, state },
      }));
    },

    setPosition: (position: number) => {
      set((state) => ({
        playback: { ...state.playback, position },
      }));
    },

    setDuration: (duration: number) => {
      set((state) => ({
        playback: { ...state.playback, duration },
      }));
    },

    setBuffering: (buffering: boolean) => {
      set((state) => ({
        playback: { ...state.playback, buffering },
      }));
    },

    setError: (type: keyof ErrorState, error: Error | null) => {
      set((state) => ({
        error: { ...state.error, [type]: error },
      }));
    },

    // Getters
    getCurrentTrack: () => {
      const { queue } = get();
      if (queue.currentIndex >= 0 && queue.currentIndex < queue.tracks.length) {
        return queue.tracks[queue.currentIndex];
      }
      return null;
    },

    hasNextTrack: () => {
      return get().getNextTrackIndex() !== -1;
    },

    hasPreviousTrack: () => {
      return get().getPreviousTrackIndex() !== -1;
    },

    getNextTrackIndex: () => {
      const { queue, settings } = get();

      if (queue.tracks.length === 0) return -1;

      if (settings.shuffle) {
        // For shuffle, pick random track
        const availableIndices = queue.tracks
          .map((_, index) => index)
          .filter((index) => index !== queue.currentIndex);

        if (availableIndices.length === 0) return -1;
        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }

      // Normal progression
      const nextIndex = queue.currentIndex + 1;

      if (nextIndex >= queue.tracks.length) {
        // End of queue
        if (settings.repeatMode === "queue") {
          return 0; // Loop to beginning
        }
        return -1; // No next track
      }

      return nextIndex;
    },

    getPreviousTrackIndex: () => {
      const { queue, settings } = get();

      if (queue.tracks.length === 0) return -1;

      if (settings.shuffle) {
        // For shuffle, pick random track
        const availableIndices = queue.tracks
          .map((_, index) => index)
          .filter((index) => index !== queue.currentIndex);

        if (availableIndices.length === 0) return -1;
        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }

      // Normal progression
      const previousIndex = queue.currentIndex - 1;

      if (previousIndex < 0) {
        // Beginning of queue
        if (settings.repeatMode === "queue") {
          return queue.tracks.length - 1; // Loop to end
        }
        return -1; // No previous track
      }

      return previousIndex;
    },
  }))
);

// Expose store for debugging in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.playerStore = usePlayerStore;
}