import type { Track } from "@/types/audio";
import type { PlayerState } from "@/types/player";
import { usePlayerStore } from "@/stores/usePlayerStore";

/**
 * AudioService — Manages HTML5 Audio playback and integrates with player store
 */
class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: Track | null = null;
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;

    this.audio = new Audio();
    this.audio.preload = "metadata";
    this.audio.crossOrigin = "anonymous";

    // Bind event listeners
    this.audio.addEventListener("loadstart", this.handleLoadStart);
    this.audio.addEventListener("loadeddata", this.handleLoadedData);
    this.audio.addEventListener("loadedmetadata", this.handleLoadedMetadata);
    this.audio.addEventListener("canplay", this.handleCanPlay);
    this.audio.addEventListener("canplaythrough", this.handleCanPlayThrough);
    this.audio.addEventListener("playing", this.handlePlaying);
    this.audio.addEventListener("pause", this.handlePause);
    this.audio.addEventListener("ended", this.handleEnded);
    this.audio.addEventListener("error", this.handleError);
    this.audio.addEventListener("waiting", this.handleWaiting);
    this.audio.addEventListener("stalled", this.handleStalled);
    this.audio.addEventListener("suspend", this.handleSuspend);
    this.audio.addEventListener("abort", this.handleAbort);
    this.audio.addEventListener("emptied", this.handleEmptied);
    this.audio.addEventListener("timeupdate", this.handleTimeUpdate);
    this.audio.addEventListener("durationchange", this.handleDurationChange);
    this.audio.addEventListener("volumechange", this.handleVolumeChange);
    this.audio.addEventListener("ratechange", this.handleRateChange);

    // Start position update interval
    this.startUpdateInterval();

    this.isInitialized = true;

    // Expose to window for store access
    window.audioService = this;
  }

  /* ─── Public API ─────────────────────────────────────────────────────────────── */

  async loadTrack(track: Track): Promise<void> {
    if (!this.audio) {
      throw new Error("Audio service not initialized");
    }

    try {
      this.updatePlayerState("loading");
      this.currentTrack = track;

      // Set audio source
      this.audio.src = track.url;
      this.audio.load();

      return new Promise((resolve, reject) => {
        const cleanup = () => {
          this.audio?.removeEventListener("canplay", onCanPlay);
          this.audio?.removeEventListener("error", onError);
        };

        const onCanPlay = () => {
          cleanup();
          this.updatePlayerState("ready");
          resolve();
        };

        const onError = () => {
          cleanup();
          const error = new Error(`Failed to load track: ${track.title}`);
          this.updatePlayerState("error");
          usePlayerStore.getState().setError("playback", error);
          reject(error);
        };

        this.audio?.addEventListener("canplay", onCanPlay);
        this.audio?.addEventListener("error", onError);

        // Timeout after 30 seconds
        setTimeout(() => {
          cleanup();
          const error = new Error(`Load timeout for track: ${track.title}`);
          this.updatePlayerState("error");
          usePlayerStore.getState().setError("playback", error);
          reject(error);
        }, 30000);
      });
    } catch (error) {
      this.updatePlayerState("error");
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.audio || !this.currentTrack) {
      throw new Error("No track loaded");
    }

    try {
      await this.audio.play();
      // handlePlaying event will update state
    } catch (error) {
      this.updatePlayerState("error");
      const playError = new Error(
        `Playback failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      usePlayerStore.getState().setError("playback", playError);
      throw playError;
    }
  }

  pause(): void {
    if (!this.audio) return;

    this.audio.pause();
    // handlePause event will update state
  }

  stop(): void {
    if (!this.audio) return;

    this.audio.pause();
    this.audio.currentTime = 0;
    this.updatePlayerState("stopped");
    usePlayerStore.getState().setPosition(0);
  }

  seekTo(position: number): void {
    if (!this.audio) return;

    this.audio.currentTime = Math.max(0, Math.min(position, this.audio.duration || 0));
  }

  setVolume(volume: number): void {
    if (!this.audio) return;

    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.audio?.volume || 0.75;
  }

  setPlaybackRate(rate: number): void {
    if (!this.audio) return;

    this.audio.playbackRate = Math.max(0.25, Math.min(2.0, rate));
  }

  getPlaybackRate(): number {
    return this.audio?.playbackRate || 1.0;
  }

  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  getDuration(): number {
    return this.audio?.duration || 0;
  }

  getBuffered(): TimeRanges | null {
    return this.audio?.buffered || null;
  }

  /* ─── Event Handlers ─────────────────────────────────────────────────────────── */

  private handleLoadStart = (): void => {
    this.updatePlayerState("loading");
  };

  private handleLoadedData = (): void => {
    // Metadata and first frame loaded
  };

  private handleLoadedMetadata = (): void => {
    const duration = this.audio?.duration || 0;
    usePlayerStore.getState().setDuration(duration);
  };

  private handleCanPlay = (): void => {
    this.updatePlayerState("ready");
    usePlayerStore.getState().setBuffering(false);
  };

  private handleCanPlayThrough = (): void => {
    usePlayerStore.getState().setBuffering(false);
  };

  private handlePlaying = (): void => {
    this.updatePlayerState("playing");
    usePlayerStore.getState().setBuffering(false);
  };

  private handlePause = (): void => {
    this.updatePlayerState("paused");
  };

  private handleEnded = (): void => {
    this.updatePlayerState("ended");

    // Handle repeat mode and auto-advance
    const { settings } = usePlayerStore.getState();

    if (settings.repeatMode === "track") {
      // Repeat current track
      this.seekTo(0);
      this.play();
    } else {
      // Try to advance to next track
      const store = usePlayerStore.getState();
      if (store.hasNextTrack()) {
        store.skipNext();
      } else if (settings.repeatMode === "queue") {
        // Restart queue
        const { queue } = store;
        if (queue.tracks.length > 0) {
          store.loadQueue(queue.tracks, 0);
          store.play();
        }
      }
    }
  };

  private handleError = (event: Event): void => {
    this.updatePlayerState("error");

    const target = event.target as HTMLAudioElement;
    let errorMessage = "Playback error";

    if (target.error) {
      switch (target.error.code) {
        case target.error.MEDIA_ERR_ABORTED:
          errorMessage = "Playback aborted";
          break;
        case target.error.MEDIA_ERR_NETWORK:
          errorMessage = "Network error during playback";
          break;
        case target.error.MEDIA_ERR_DECODE:
          errorMessage = "Audio decoding failed";
          break;
        case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio format not supported";
          break;
        default:
          errorMessage = "Unknown playback error";
      }
    }

    const error = new Error(errorMessage);
    usePlayerStore.getState().setError("playback", error);
  };

  private handleWaiting = (): void => {
    usePlayerStore.getState().setBuffering(true);
  };

  private handleStalled = (): void => {
    usePlayerStore.getState().setBuffering(true);
  };

  private handleSuspend = (): void => {
    // Data loading suspended
  };

  private handleAbort = (): void => {
    this.updatePlayerState("error");
    const error = new Error("Audio loading aborted");
    usePlayerStore.getState().setError("playback", error);
  };

  private handleEmptied = (): void => {
    this.updatePlayerState("none");
    usePlayerStore.getState().setPosition(0);
    usePlayerStore.getState().setDuration(0);
  };

  private handleTimeUpdate = (): void => {
    const currentTime = this.audio?.currentTime || 0;
    usePlayerStore.getState().setPosition(currentTime);
  };

  private handleDurationChange = (): void => {
    const duration = this.audio?.duration || 0;
    usePlayerStore.getState().setDuration(duration);
  };

  private handleVolumeChange = (): void => {
    // Volume changed externally
  };

  private handleRateChange = (): void => {
    const rate = this.audio?.playbackRate || 1.0;
    usePlayerStore.getState().updatePlaybackState({ rate });
  };

  /* ─── Internal Helpers ───────────────────────────────────────────────────────── */

  private updatePlayerState(state: PlayerState): void {
    usePlayerStore.getState().setPlayerState(state);
  }

  private startUpdateInterval(): void {
    // Update position every 100ms for smooth progress
    this.updateInterval = setInterval(() => {
      if (this.audio && !this.audio.paused) {
        const currentTime = this.audio.currentTime;
        usePlayerStore.getState().setPosition(currentTime);
      }
    }, 100);
  }

  /* ─── Cleanup ────────────────────────────────────────────────────────────────── */

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.audio) {
      // Remove all event listeners
      this.audio.removeEventListener("loadstart", this.handleLoadStart);
      this.audio.removeEventListener("loadeddata", this.handleLoadedData);
      this.audio.removeEventListener("loadedmetadata", this.handleLoadedMetadata);
      this.audio.removeEventListener("canplay", this.handleCanPlay);
      this.audio.removeEventListener("canplaythrough", this.handleCanPlayThrough);
      this.audio.removeEventListener("playing", this.handlePlaying);
      this.audio.removeEventListener("pause", this.handlePause);
      this.audio.removeEventListener("ended", this.handleEnded);
      this.audio.removeEventListener("error", this.handleError);
      this.audio.removeEventListener("waiting", this.handleWaiting);
      this.audio.removeEventListener("stalled", this.handleStalled);
      this.audio.removeEventListener("suspend", this.handleSuspend);
      this.audio.removeEventListener("abort", this.handleAbort);
      this.audio.removeEventListener("emptied", this.handleEmptied);
      this.audio.removeEventListener("timeupdate", this.handleTimeUpdate);
      this.audio.removeEventListener("durationchange", this.handleDurationChange);
      this.audio.removeEventListener("volumechange", this.handleVolumeChange);
      this.audio.removeEventListener("ratechange", this.handleRateChange);

      this.audio.pause();
      this.audio.src = "";
      this.audio.load();
      this.audio = null;
    }

    this.currentTrack = null;
    this.isInitialized = false;

    // Remove from window
    if (typeof window !== "undefined") {
      delete window.audioService;
    }
  }
}

// Create singleton instance
let audioServiceInstance: AudioService | null = null;

export function getAudioService(): AudioService {
  if (typeof window === "undefined") {
    // Return a mock service for SSR
    return {} as AudioService;
  }

  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }

  return audioServiceInstance;
}

export function destroyAudioService(): void {
  if (audioServiceInstance) {
    audioServiceInstance.destroy();
    audioServiceInstance = null;
  }
}

// Auto-initialize on client
if (typeof window !== "undefined") {
  getAudioService();
}

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", destroyAudioService);
}

// Export the service class for testing
export { AudioService };