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
    if (typeof window === "undefined") {
      // SSR: create a no-op stub to prevent crashes during server-side rendering
      this.audio = {} as HTMLAudioElement;
      return;
    }
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
