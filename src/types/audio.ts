export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  reciterId: string;
  reciterName: string;
  surahId: number;
  rewayatId: string;
}

export type RepeatMode = "none" | "queue" | "track";

export interface PlaybackState {
  isPlaying: boolean;
  currentTrackIndex: number;
  positionMs: number;
  durationMs: number;
  rate: number;
  volume: number;
  isMuted: boolean;
}

export interface PlayerSettings {
  repeatMode: RepeatMode;
  shuffle: boolean;
  rate: number;
  /** User-selected duration (in minutes), or null when the timer is off. */
  sleepTimerMinutes: number | null;
  /** Unix ms timestamp the timer expires at, or null when off. Computed from
   * sleepTimerMinutes at the moment the user sets it; the timer hook compares
   * Date.now() against this value to know when to pause. */
  sleepTimerEndsAt: number | null;
}
