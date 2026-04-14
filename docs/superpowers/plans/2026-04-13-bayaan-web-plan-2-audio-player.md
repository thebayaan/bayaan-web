# Bayaan Web — Plan 2: Audio Player

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully functional Spotify-style audio player with queue management, playback controls, persistent bottom bar, expandable full player view, and keyboard shortcuts.

**Architecture:** Three-layer architecture mirroring the mobile app: AudioService singleton (wraps HTML5 Audio), playerStore (Zustand with persist), AudioCoordinator (mutual exclusion). UI components: BottomPlayerBar (replaces placeholder), FullPlayerView (sheet/dialog), QueuePanel (slide-out). All state flows through the Zustand store — UI components are pure consumers.

**Tech Stack:** HTML5 Audio API, Zustand (persist to localStorage), Media Session API, shadcn/ui (Sheet, Slider, Dialog), Framer Motion, dnd-kit (queue reorder)

**Testing:** Vitest for AudioService unit tests, playerStore state tests, component rendering tests with React Testing Library.

**Spec:** `docs/superpowers/specs/2026-04-13-bayaan-web-design.md` (Section 3: Audio Player)

**Depends on:** Plan 1 (Foundation) — completed

---

## File Structure (Plan 2)

```
src/
├── services/
│   └── audio/
│       ├── audio-service.ts          # HTML5 Audio wrapper singleton
│       └── audio-coordinator.ts      # Main/mushaf mutual exclusion
├── stores/
│   └── player-store.ts              # Zustand player state + actions
├── hooks/
│   ├── use-keyboard-shortcuts.ts    # Global keyboard handler
│   └── use-media-session.ts         # OS media controls
├── components/
│   ├── player/
│   │   ├── bottom-player-bar.tsx    # Replaces placeholder
│   │   ├── player-controls.tsx      # Play/pause/next/prev/seek
│   │   ├── progress-bar.tsx         # Seekable progress slider
│   │   ├── volume-control.tsx       # Volume slider + mute
│   │   ├── full-player-view.tsx     # Expanded sheet player
│   │   └── queue-panel.tsx          # Slide-out queue list
│   └── layout/
│       └── bottom-player-bar.tsx    # REPLACED (was placeholder)
└── __tests__/
    ├── services/
    │   ├── audio-service.test.ts
    │   └── audio-coordinator.test.ts
    ├── stores/
    │   └── player-store.test.ts
    └── components/
        └── player/
            ├── bottom-player-bar.test.tsx
            ├── player-controls.test.tsx
            └── progress-bar.test.tsx
```

---

### Task 1: AudioService — HTML5 Audio Wrapper

**Files:**
- Create: `src/services/audio/audio-service.ts`
- Test: `src/__tests__/services/audio-service.test.ts`

- [ ] **Step 1: Write AudioService tests**

Create `src/__tests__/services/audio-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock HTMLAudioElement
function createMockAudio() {
  const audio = {
    src: "",
    currentTime: 0,
    duration: 120,
    paused: true,
    volume: 1,
    muted: false,
    playbackRate: 1,
    readyState: 0,
    buffered: { length: 0, start: vi.fn(), end: vi.fn() },
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  return audio;
}

// We test the AudioService by importing it after mocking
let AudioService: typeof import("@/services/audio/audio-service").AudioService;
let mockAudio: ReturnType<typeof createMockAudio>;

beforeEach(async () => {
  vi.resetModules();
  mockAudio = createMockAudio();
  vi.stubGlobal("Audio", vi.fn(() => mockAudio));
  const mod = await import("@/services/audio/audio-service");
  AudioService = mod.AudioService;
});

describe("AudioService", () => {
  it("is a singleton", () => {
    const a = AudioService.getInstance();
    const b = AudioService.getInstance();
    expect(a).toBe(b);
  });

  it("loads a track by setting src", () => {
    const service = AudioService.getInstance();
    service.load("https://cdn.thebayaan.com/quran/001.mp3");
    expect(mockAudio.src).toBe("https://cdn.thebayaan.com/quran/001.mp3");
  });

  it("calls audio.play() on play", async () => {
    const service = AudioService.getInstance();
    service.load("https://cdn.thebayaan.com/quran/001.mp3");
    await service.play();
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("calls audio.pause() on pause", () => {
    const service = AudioService.getInstance();
    service.pause();
    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it("seeks to a position in seconds", () => {
    const service = AudioService.getInstance();
    service.seek(30);
    expect(mockAudio.currentTime).toBe(30);
  });

  it("clamps playback rate to 0.5-2.0", () => {
    const service = AudioService.getInstance();
    service.setRate(3);
    expect(mockAudio.playbackRate).toBe(2);
    service.setRate(0.1);
    expect(mockAudio.playbackRate).toBe(0.5);
    service.setRate(1.5);
    expect(mockAudio.playbackRate).toBe(1.5);
  });

  it("clamps volume to 0-1", () => {
    const service = AudioService.getInstance();
    service.setVolume(1.5);
    expect(mockAudio.volume).toBe(1);
    service.setVolume(-0.5);
    expect(mockAudio.volume).toBe(0);
    service.setVolume(0.7);
    expect(mockAudio.volume).toBe(0.7);
  });

  it("toggles muted state", () => {
    const service = AudioService.getInstance();
    service.setMuted(true);
    expect(mockAudio.muted).toBe(true);
    service.setMuted(false);
    expect(mockAudio.muted).toBe(false);
  });

  it("reports current playback state", () => {
    const service = AudioService.getInstance();
    mockAudio.currentTime = 42;
    mockAudio.duration = 120;
    mockAudio.paused = false;
    expect(service.getCurrentTime()).toBe(42);
    expect(service.getDuration()).toBe(120);
    expect(service.getIsPlaying()).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

```bash
npm test -- --run src/__tests__/services/audio-service.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AudioService**

Create `src/services/audio/audio-service.ts`:

```typescript
type AudioEventType =
  | "timeupdate"
  | "ended"
  | "error"
  | "loadedmetadata"
  | "playing"
  | "pause"
  | "waiting"
  | "canplay";

type AudioEventListener = (event: Event) => void;

export class AudioService {
  private static instance: AudioService | null = null;
  private audio: HTMLAudioElement;
  private listeners: Map<AudioEventType, Set<AudioEventListener>> = new Map();

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto";
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // For testing — reset singleton
  static resetInstance(): void {
    if (AudioService.instance) {
      AudioService.instance.cleanup();
      AudioService.instance = null;
    }
  }

  load(url: string): void {
    this.audio.src = url;
    this.audio.load();
  }

  async play(): Promise<void> {
    await this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  seek(seconds: number): void {
    this.audio.currentTime = seconds;
  }

  setRate(rate: number): void {
    this.audio.playbackRate = Math.min(2, Math.max(0.5, rate));
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.min(1, Math.max(0, volume));
  }

  setMuted(muted: boolean): void {
    this.audio.muted = muted;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  getIsPlaying(): boolean {
    return !this.audio.paused;
  }

  getIsLoaded(): boolean {
    return this.audio.readyState >= 2;
  }

  getVolume(): number {
    return this.audio.volume;
  }

  getIsMuted(): boolean {
    return this.audio.muted;
  }

  getPlaybackRate(): number {
    return this.audio.playbackRate;
  }

  getCurrentUrl(): string | null {
    return this.audio.src || null;
  }

  on(event: AudioEventType, listener: AudioEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    this.audio.addEventListener(event, listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
      this.audio.removeEventListener(event, listener);
    };
  }

  cleanup(): void {
    this.audio.pause();
    this.audio.src = "";
    this.listeners.forEach((listeners, event) => {
      listeners.forEach((listener) => {
        this.audio.removeEventListener(event, listener);
      });
    });
    this.listeners.clear();
  }
}

export const audioService = AudioService.getInstance();
```

- [ ] **Step 4: Run tests — they should pass**

```bash
npm test -- --run src/__tests__/services/audio-service.test.ts
```

Expected: All 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/audio/audio-service.ts src/__tests__/services/audio-service.test.ts
git commit -m "feat: add AudioService wrapping HTML5 Audio element"
```

---

### Task 2: AudioCoordinator — Mutual Exclusion

**Files:**
- Create: `src/services/audio/audio-coordinator.ts`
- Test: `src/__tests__/services/audio-coordinator.test.ts`

- [ ] **Step 1: Write AudioCoordinator tests**

Create `src/__tests__/services/audio-coordinator.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { AudioCoordinator } from "@/services/audio/audio-coordinator";

describe("AudioCoordinator", () => {
  let coordinator: AudioCoordinator;

  beforeEach(() => {
    coordinator = new AudioCoordinator();
  });

  it("starts with no active source", () => {
    expect(coordinator.getActiveSource()).toBe("none");
  });

  it("sets active source to main on mainWillPlay", () => {
    coordinator.mainWillPlay();
    expect(coordinator.getActiveSource()).toBe("main");
  });

  it("sets active source to mushaf on mushafWillPlay", () => {
    coordinator.mushafWillPlay();
    expect(coordinator.getActiveSource()).toBe("mushaf");
  });

  it("switches from main to mushaf", () => {
    coordinator.mainWillPlay();
    expect(coordinator.getActiveSource()).toBe("main");
    coordinator.mushafWillPlay();
    expect(coordinator.getActiveSource()).toBe("mushaf");
  });

  it("switches from mushaf to main", () => {
    coordinator.mushafWillPlay();
    expect(coordinator.getActiveSource()).toBe("mushaf");
    coordinator.mainWillPlay();
    expect(coordinator.getActiveSource()).toBe("main");
  });

  it("clears source on sourceDidStop", () => {
    coordinator.mainWillPlay();
    coordinator.sourceDidStop("main");
    expect(coordinator.getActiveSource()).toBe("none");
  });

  it("does not clear if a different source stops", () => {
    coordinator.mainWillPlay();
    coordinator.sourceDidStop("mushaf");
    expect(coordinator.getActiveSource()).toBe("main");
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

```bash
npm test -- --run src/__tests__/services/audio-coordinator.test.ts
```

- [ ] **Step 3: Implement AudioCoordinator**

Create `src/services/audio/audio-coordinator.ts`:

```typescript
export type AudioSource = "main" | "mushaf" | "none";

export class AudioCoordinator {
  private activeSource: AudioSource = "none";
  private onPauseMain: (() => void) | null = null;
  private onPauseMushaf: (() => void) | null = null;

  getActiveSource(): AudioSource {
    return this.activeSource;
  }

  registerPauseHandler(
    source: "main" | "mushaf",
    handler: () => void
  ): void {
    if (source === "main") {
      this.onPauseMain = handler;
    } else {
      this.onPauseMushaf = handler;
    }
  }

  mainWillPlay(): void {
    if (this.activeSource === "mushaf" && this.onPauseMushaf) {
      this.onPauseMushaf();
    }
    this.activeSource = "main";
  }

  mushafWillPlay(): void {
    if (this.activeSource === "main" && this.onPauseMain) {
      this.onPauseMain();
    }
    this.activeSource = "mushaf";
  }

  sourceDidStop(source: AudioSource): void {
    if (this.activeSource === source) {
      this.activeSource = "none";
    }
  }
}

export const audioCoordinator = new AudioCoordinator();
```

- [ ] **Step 4: Run tests — they should pass**

```bash
npm test -- --run src/__tests__/services/audio-coordinator.test.ts
```

Expected: All 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/audio/audio-coordinator.ts src/__tests__/services/audio-coordinator.test.ts
git commit -m "feat: add AudioCoordinator for main/mushaf mutual exclusion"
```

---

### Task 3: Player Store — Zustand State Management

**Files:**
- Create: `src/stores/player-store.ts`
- Test: `src/__tests__/stores/player-store.test.ts`

- [ ] **Step 1: Write player store tests**

Create `src/__tests__/stores/player-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock audio service before importing store
vi.mock("@/services/audio/audio-service", () => ({
  audioService: {
    load: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    seek: vi.fn(),
    setRate: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    getCurrentTime: vi.fn(() => 0),
    getDuration: vi.fn(() => 120),
    getIsPlaying: vi.fn(() => false),
    getVolume: vi.fn(() => 1),
    getIsMuted: vi.fn(() => false),
    on: vi.fn(() => vi.fn()),
    cleanup: vi.fn(),
  },
}));

vi.mock("@/services/audio/audio-coordinator", () => ({
  audioCoordinator: {
    mainWillPlay: vi.fn(),
    sourceDidStop: vi.fn(),
    registerPauseHandler: vi.fn(),
  },
}));

import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/audio";

const mockTrack: Track = {
  id: "t-1",
  url: "https://cdn.thebayaan.com/quran/recitations/test/001.mp3",
  title: "Al-Fatiha",
  artist: "Mishary Alafasy",
  artwork: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
  duration: 120000,
  reciterId: "r-1",
  reciterName: "Mishary Alafasy",
  surahId: 1,
  rewayatId: "rw-1",
};

const mockTrack2: Track = {
  ...mockTrack,
  id: "t-2",
  title: "Al-Baqarah",
  surahId: 2,
  url: "https://cdn.thebayaan.com/quran/recitations/test/002.mp3",
};

describe("player-store", () => {
  beforeEach(() => {
    usePlayerStore.setState(usePlayerStore.getInitialState());
  });

  describe("queue management", () => {
    it("starts with empty queue", () => {
      const state = usePlayerStore.getState();
      expect(state.queue.tracks).toHaveLength(0);
      expect(state.queue.currentIndex).toBe(-1);
    });

    it("updates queue with tracks", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack, mockTrack2]);
      const state = usePlayerStore.getState();
      expect(state.queue.tracks).toHaveLength(2);
      expect(state.queue.currentIndex).toBe(0);
    });

    it("adds tracks to queue", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack]);
      await usePlayerStore.getState().addToQueue([mockTrack2]);
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(2);
    });

    it("removes tracks from queue by index", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack, mockTrack2]);
      usePlayerStore.getState().removeFromQueue([1]);
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(1);
      expect(usePlayerStore.getState().queue.tracks[0]?.id).toBe("t-1");
    });

    it("moves tracks in queue", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack, mockTrack2]);
      usePlayerStore.getState().moveInQueue(0, 1);
      const tracks = usePlayerStore.getState().queue.tracks;
      expect(tracks[0]?.id).toBe("t-2");
      expect(tracks[1]?.id).toBe("t-1");
    });
  });

  describe("playback settings", () => {
    it("defaults to no repeat", () => {
      expect(usePlayerStore.getState().settings.repeatMode).toBe("none");
    });

    it("cycles repeat mode", () => {
      usePlayerStore.getState().setRepeatMode("queue");
      expect(usePlayerStore.getState().settings.repeatMode).toBe("queue");
      usePlayerStore.getState().setRepeatMode("track");
      expect(usePlayerStore.getState().settings.repeatMode).toBe("track");
    });

    it("toggles shuffle", () => {
      expect(usePlayerStore.getState().settings.shuffle).toBe(false);
      usePlayerStore.getState().toggleShuffle();
      expect(usePlayerStore.getState().settings.shuffle).toBe(true);
    });

    it("sets sleep timer", () => {
      usePlayerStore.getState().setSleepTimer(30);
      expect(usePlayerStore.getState().settings.sleepTimerMinutes).toBe(30);
    });
  });

  describe("playback state", () => {
    it("updates playback position", () => {
      usePlayerStore.getState().updatePlayback({ positionMs: 5000 });
      expect(usePlayerStore.getState().playback.positionMs).toBe(5000);
    });

    it("updates volume", () => {
      usePlayerStore.getState().updatePlayback({ volume: 0.5 });
      expect(usePlayerStore.getState().playback.volume).toBe(0.5);
    });
  });

  describe("reset", () => {
    it("resets to initial state", async () => {
      await usePlayerStore.getState().updateQueue([mockTrack]);
      usePlayerStore.getState().reset();
      expect(usePlayerStore.getState().queue.tracks).toHaveLength(0);
    });
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

```bash
npm test -- --run src/__tests__/stores/player-store.test.ts
```

- [ ] **Step 3: Implement playerStore**

Create `src/stores/player-store.ts`:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track, RepeatMode, PlaybackState, PlayerSettings } from "@/types/audio";
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

function getCurrentTrack(state: PlayerStoreState): Track | undefined {
  return state.queue.tracks[state.queue.currentIndex];
}

export function getInitialState(): Omit<PlayerStoreState, keyof PlayerActions> {
  return {
    queue: { tracks: [], currentIndex: -1 },
    playback: { ...INITIAL_PLAYBACK },
    settings: { ...INITIAL_SETTINGS },
    isLoading: false,
  };
}

type PlayerActions = Pick<
  PlayerStoreState,
  | "updateQueue" | "addToQueue" | "removeFromQueue" | "moveInQueue"
  | "play" | "pause" | "skipToNext" | "skipToPrevious" | "seekTo"
  | "setRepeatMode" | "toggleShuffle" | "setSleepTimer" | "setRate"
  | "updatePlayback" | "reset"
>;

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

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
            (i) => i < s.queue.currentIndex
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
        set(getInitialState());
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
            t.url.includes("mp3quran.net") ||
            t.url.includes("supabase.co")
        );
        if (hasBadUrls) {
          state.queue = { tracks: [], currentIndex: -1 };
        }
      },
    }
  )
);

// Expose getInitialState for testing
usePlayerStore.getInitialState = () => ({
  queue: { tracks: [], currentIndex: -1 },
  playback: { ...INITIAL_PLAYBACK },
  settings: { ...INITIAL_SETTINGS },
  isLoading: false,
}) as unknown as () => PlayerStoreState;
```

- [ ] **Step 4: Run tests — they should pass**

```bash
npm test -- --run src/__tests__/stores/player-store.test.ts
```

Expected: All 10 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npx tsc --noEmit && npm test
```

Expected: All tests pass, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/stores/player-store.ts src/__tests__/stores/player-store.test.ts
git commit -m "feat: add Zustand player store with queue and playback management"
```

---

### Task 4: Player UI Components — ProgressBar and PlayerControls

**Files:**
- Create: `src/components/player/progress-bar.tsx`, `src/components/player/player-controls.tsx`, `src/components/player/volume-control.tsx`
- Test: `src/__tests__/components/player/progress-bar.test.tsx`, `src/__tests__/components/player/player-controls.test.tsx`

- [ ] **Step 1: Install shadcn Slider component**

```bash
npx shadcn@latest add slider
```

- [ ] **Step 2: Write ProgressBar tests**

Create `src/__tests__/components/player/progress-bar.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/player/progress-bar";

describe("ProgressBar", () => {
  it("displays formatted time values", () => {
    render(
      <ProgressBar
        positionMs={90000}
        durationMs={300000}
        onSeek={vi.fn()}
      />
    );
    expect(screen.getByText("1:30")).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });

  it("displays 0:00 when no duration", () => {
    render(
      <ProgressBar positionMs={0} durationMs={0} onSeek={vi.fn()} />
    );
    const zeros = screen.getAllByText("0:00");
    expect(zeros).toHaveLength(2);
  });
});
```

- [ ] **Step 3: Write PlayerControls tests**

Create `src/__tests__/components/player/player-controls.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerControls } from "@/components/player/player-controls";

describe("PlayerControls", () => {
  const defaultProps = {
    isPlaying: false,
    onPlayPause: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    repeatMode: "none" as const,
    onRepeatChange: vi.fn(),
    shuffle: false,
    onShuffleToggle: vi.fn(),
  };

  it("renders play button when paused", () => {
    render(<PlayerControls {...defaultProps} />);
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("renders pause button when playing", () => {
    render(<PlayerControls {...defaultProps} isPlaying />);
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("calls onPlayPause when play button clicked", async () => {
    const user = userEvent.setup();
    const onPlayPause = vi.fn();
    render(<PlayerControls {...defaultProps} onPlayPause={onPlayPause} />);
    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button clicked", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<PlayerControls {...defaultProps} onNext={onNext} />);
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onPrevious when previous button clicked", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    render(<PlayerControls {...defaultProps} onPrevious={onPrevious} />);
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 4: Implement ProgressBar**

Create `src/components/player/progress-bar.tsx`:

```tsx
"use client";

import { Slider } from "@/components/ui/slider";
import { useCallback, useState } from "react";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface ProgressBarProps {
  positionMs: number;
  durationMs: number;
  onSeek: (positionMs: number) => void;
  compact?: boolean;
}

export function ProgressBar({
  positionMs,
  durationMs,
  onSeek,
  compact,
}: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;
  const displayProgress = isDragging ? dragValue : progress;

  const handleValueChange = useCallback(
    (value: number[]) => {
      const v = value[0] ?? 0;
      setDragValue(v);
      setIsDragging(true);
    },
    []
  );

  const handleValueCommit = useCallback(
    (value: number[]) => {
      const v = value[0] ?? 0;
      const seekMs = (v / 100) * durationMs;
      onSeek(seekMs);
      setIsDragging(false);
    },
    [durationMs, onSeek]
  );

  if (compact) {
    return (
      <div className="w-full h-1 bg-[var(--text-alpha-06)] rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground/60 transition-[width] duration-200"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[10px] text-muted-foreground w-10 text-right tabular-nums">
        {formatTime(isDragging ? (dragValue / 100) * durationMs : positionMs)}
      </span>
      <Slider
        value={[displayProgress]}
        max={100}
        step={0.1}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className="flex-1"
      />
      <span className="text-[10px] text-muted-foreground w-10 tabular-nums">
        {formatTime(durationMs)}
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Implement PlayerControls**

Create `src/components/player/player-controls.tsx`:

```tsx
"use client";

import { PlayIcon, PauseIcon, NextIcon, PreviousIcon } from "@/components/icons";
import type { RepeatMode } from "@/types/audio";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  repeatMode: RepeatMode;
  onRepeatChange: () => void;
  shuffle: boolean;
  onShuffleToggle: () => void;
  compact?: boolean;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  repeatMode,
  onRepeatChange,
  shuffle,
  onShuffleToggle,
  compact,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {!compact && (
        <button
          onClick={onShuffleToggle}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            shuffle
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
          </svg>
        </button>
      )}

      <button
        onClick={onPrevious}
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Previous track"
      >
        <PreviousIcon size={compact ? 16 : 20} />
      </button>

      <button
        onClick={onPlayPause}
        className={cn(
          "flex items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105",
          compact ? "w-8 h-8" : "w-9 h-9"
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <PauseIcon size={compact ? 14 : 16} color="currentColor" />
        ) : (
          <PlayIcon size={compact ? 14 : 16} color="currentColor" />
        )}
      </button>

      <button
        onClick={onNext}
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Next track"
      >
        <NextIcon size={compact ? 16 : 20} />
      </button>

      {!compact && (
        <button
          onClick={onRepeatChange}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            repeatMode !== "none"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`Repeat: ${repeatMode}`}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          {repeatMode === "track" && (
            <span className="absolute text-[8px] font-bold">1</span>
          )}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Implement VolumeControl**

Create `src/components/player/volume-control.tsx`:

```tsx
"use client";

import { Slider } from "@/components/ui/slider";
import { useCallback, useState } from "react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const [prevVolume, setPrevVolume] = useState(volume);

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      onVolumeChange(prevVolume || 0.5);
    } else {
      setPrevVolume(volume);
    }
    onMuteToggle();
  }, [isMuted, onMuteToggle, onVolumeChange, prevVolume, volume]);

  const displayVolume = isMuted ? 0 : volume;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleMuteToggle}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {isMuted || displayVolume === 0 ? (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : displayVolume < 0.5 ? (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </>
          ) : (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
            </>
          )}
        </svg>
      </button>
      <Slider
        value={[displayVolume * 100]}
        max={100}
        step={1}
        onValueChange={([v]) =>
          v !== undefined && onVolumeChange(v / 100)
        }
        className="w-24"
      />
    </div>
  );
}
```

- [ ] **Step 7: Run tests**

```bash
npx tsc --noEmit && npm test
```

Expected: All tests pass, no type errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add player UI components — controls, progress bar, volume"
```

---

### Task 5: BottomPlayerBar — Replace Placeholder

**Files:**
- Modify: `src/components/layout/bottom-player-bar.tsx` (replace entirely)
- Create: `src/__tests__/components/player/bottom-player-bar.test.tsx`

- [ ] **Step 1: Write BottomPlayerBar tests**

Create `src/__tests__/components/player/bottom-player-bar.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/stores/player-store", () => ({
  usePlayerStore: Object.assign(
    (selector: Function) => {
      const state = {
        queue: {
          tracks: [
            {
              id: "t-1",
              title: "Al-Fatiha",
              artist: "Mishary Alafasy",
              artwork: "https://cdn.thebayaan.com/test.jpg",
              url: "https://cdn.thebayaan.com/001.mp3",
              duration: 120000,
              reciterId: "r-1",
              reciterName: "Mishary Alafasy",
              surahId: 1,
              rewayatId: "rw-1",
            },
          ],
          currentIndex: 0,
        },
        playback: {
          isPlaying: false,
          positionMs: 30000,
          durationMs: 120000,
          rate: 1,
          volume: 1,
          isMuted: false,
          currentTrackIndex: 0,
        },
        settings: { repeatMode: "none", shuffle: false, rate: 1, sleepTimerMinutes: null },
        play: vi.fn(),
        pause: vi.fn(),
        skipToNext: vi.fn(),
        skipToPrevious: vi.fn(),
        seekTo: vi.fn(),
      };
      return selector(state);
    },
    { getState: vi.fn() }
  ),
}));

import { BottomPlayerBar } from "@/components/player/bottom-player-bar";

describe("BottomPlayerBar", () => {
  it("renders track info when a track is loaded", () => {
    render(<BottomPlayerBar />);
    expect(screen.getByText("Al-Fatiha")).toBeInTheDocument();
    expect(screen.getByText("Mishary Alafasy")).toBeInTheDocument();
  });

  it("renders play/pause button", () => {
    render(<BottomPlayerBar />);
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement BottomPlayerBar**

Replace `src/components/layout/bottom-player-bar.tsx` — this is now a re-export from the player module:

```tsx
export { BottomPlayerBar } from "@/components/player/bottom-player-bar";
```

Create `src/components/player/bottom-player-bar.tsx`:

```tsx
"use client";

import Image from "next/image";
import { usePlayerStore } from "@/stores/player-store";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";
import { VolumeControl } from "./volume-control";
import { audioService } from "@/services/audio/audio-service";
import type { RepeatMode } from "@/types/audio";

export function BottomPlayerBar() {
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

  if (!currentTrack) {
    return (
      <footer className="h-20 border-t border-border bg-background/80 backdrop-blur-2xl flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Select a reciter to start listening</p>
      </footer>
    );
  }

  const handlePlayPause = () => {
    if (playback.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const cycleRepeat = () => {
    const modes: RepeatMode[] = ["none", "queue", "track"];
    const currentIdx = modes.indexOf(settings.repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length]!;
    setRepeatMode(nextMode);
  };

  const handleVolumeChange = (vol: number) => {
    audioService.setVolume(vol);
    usePlayerStore.getState().updatePlayback({ volume: vol, isMuted: false });
  };

  const handleMuteToggle = () => {
    const newMuted = !playback.isMuted;
    audioService.setMuted(newMuted);
    usePlayerStore.getState().updatePlayback({ isMuted: newMuted });
  };

  return (
    <footer className="h-20 border-t border-border bg-background/80 backdrop-blur-2xl flex items-center px-4 gap-4">
      {/* Track Info — Left */}
      <div className="flex items-center gap-3 w-[240px] min-w-0">
        <div className="w-12 h-12 rounded-lg bg-[var(--text-alpha-06)] overflow-hidden shrink-0">
          {currentTrack.artwork && (
            <Image
              src={currentTrack.artwork}
              alt={currentTrack.title}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Controls + Progress — Center */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px]">
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

      {/* Volume — Right */}
      <div className="flex items-center justify-end w-[200px]">
        <VolumeControl
          volume={playback.volume}
          isMuted={playback.isMuted}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
        />
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update AppShell to use the new BottomPlayerBar**

The `app-shell.tsx` already imports from `./bottom-player-bar` which now re-exports the real player component. No changes needed to AppShell.

- [ ] **Step 4: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build Spotify-style bottom player bar with controls and progress"
```

---

### Task 6: Audio Event Binding — Connect AudioService to Store

**Files:**
- Create: `src/hooks/use-audio-events.ts`
- Modify: `src/components/player/bottom-player-bar.tsx` (add hook call)

- [ ] **Step 1: Create audio events hook**

Create `src/hooks/use-audio-events.ts`:

```tsx
"use client";

import { useEffect } from "react";
import { audioService } from "@/services/audio/audio-service";
import { usePlayerStore } from "@/stores/player-store";

export function useAudioEvents(): void {
  useEffect(() => {
    const unsubTimeUpdate = audioService.on("timeupdate", () => {
      const positionMs = audioService.getCurrentTime() * 1000;
      const durationMs = audioService.getDuration() * 1000;
      usePlayerStore.getState().updatePlayback({ positionMs, durationMs });
    });

    const unsubEnded = audioService.on("ended", () => {
      usePlayerStore.getState().skipToNext();
    });

    const unsubLoadedMetadata = audioService.on("loadedmetadata", () => {
      const durationMs = audioService.getDuration() * 1000;
      usePlayerStore.getState().updatePlayback({ durationMs });
    });

    const unsubError = audioService.on("error", () => {
      usePlayerStore.getState().updatePlayback({ isPlaying: false });
    });

    return () => {
      unsubTimeUpdate();
      unsubEnded();
      unsubLoadedMetadata();
      unsubError();
    };
  }, []);
}
```

- [ ] **Step 2: Wire hook into BottomPlayerBar**

Add to the top of the `BottomPlayerBar` component function in `src/components/player/bottom-player-bar.tsx`:

```tsx
import { useAudioEvents } from "@/hooks/use-audio-events";

// Inside the component, before any other hooks:
useAudioEvents();
```

- [ ] **Step 3: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: bind AudioService events to player store"
```

---

### Task 7: Keyboard Shortcuts

**Files:**
- Create: `src/hooks/use-keyboard-shortcuts.ts`
- Modify: `src/app/(app)/layout.tsx` (add hook)

- [ ] **Step 1: Create keyboard shortcuts hook**

Create `src/hooks/use-keyboard-shortcuts.ts`:

```tsx
"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { audioService } from "@/services/audio/audio-service";

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs
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
          const newPos = state.playback.positionMs - 10000;
          state.seekTo(Math.max(newPos, 0));
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
            'input[type="search"], input[placeholder*="Search"]'
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
```

- [ ] **Step 2: Wire into app layout**

Add to `src/app/(app)/layout.tsx`:

```tsx
"use client"; // Add this at the top if not already

import { AppShell } from "@/components/layout/app-shell";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <AppShell>{children}</AppShell>;
}
```

Note: Since this adds `"use client"` to the layout, the AppShell import still works because it's already a mix of client and server components.

- [ ] **Step 3: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add keyboard shortcuts for player controls"
```

---

### Task 8: Media Session API

**Files:**
- Create: `src/hooks/use-media-session.ts`
- Modify: `src/components/player/bottom-player-bar.tsx` (add hook call)

- [ ] **Step 1: Create media session hook**

Create `src/hooks/use-media-session.ts`:

```tsx
"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";

export function useMediaSession(): void {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const skipToPrevious = usePlayerStore((s) => s.skipToPrevious);

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: currentTrack.artwork
        ? [{ src: currentTrack.artwork, sizes: "256x256", type: "image/jpeg" }]
        : [],
    });
  }, [currentTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => play());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => skipToNext());
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      skipToPrevious()
    );

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [play, pause, skipToNext, skipToPrevious]);
}
```

- [ ] **Step 2: Wire into BottomPlayerBar**

Add to `src/components/player/bottom-player-bar.tsx`, after the `useAudioEvents()` call:

```tsx
import { useMediaSession } from "@/hooks/use-media-session";

// Inside component:
useMediaSession();
```

- [ ] **Step 3: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Media Session API for OS-level playback controls"
```

---

## Completion Criteria

After completing all 8 tasks:
1. `npm run dev` starts without errors
2. AudioService wraps HTML5 Audio with full playback control
3. Player store manages queue, playback state, settings — persists to localStorage
4. AudioCoordinator ensures mutual exclusion between main and mushaf player
5. BottomPlayerBar shows track info, controls, progress, and volume (or empty state message when no track)
6. Keyboard shortcuts work (Space=play/pause, arrows=seek/volume, M=mute, N/P=next/prev)
7. Media Session API shows Now Playing info in OS controls
8. `npx tsc --noEmit` passes with zero errors
9. `npm test` passes with all tests green (existing + new)
10. All changes committed on `feat/bayaan-web-design`

Note: The FullPlayerView (expanded sheet) and QueuePanel (slide-out) will be built as part of Plan 3 alongside the listening pages, since they're better tested with real reciter data flowing through the system.
