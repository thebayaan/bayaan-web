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
  sleepTimerMinutes: number | null;
}
