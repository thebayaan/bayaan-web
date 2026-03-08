import { Track } from './audio';

export type PlayerState =
  | 'none'
  | 'loading'
  | 'buffering'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'ended'
  | 'error';

export type RepeatMode = 'none' | 'queue' | 'track';

export interface PlaybackState {
  state: PlayerState;
  position: number;
  duration: number;
  rate: number;
  buffering: boolean;
}

export interface QueueState {
  tracks: Track[];
  currentIndex: number;
  loading: boolean;
  endReached: boolean;
  total: number;
}

export interface LoadingState {
  trackLoading: boolean;
  queueLoading: boolean;
  stateRestoring: boolean;
}

export interface ErrorState {
  playback: Error | null;
  queue: Error | null;
  system: Error | null;
}

export interface PlaybackSettings {
  repeatMode: RepeatMode;
  shuffle: boolean;
  sleepTimer: number;
  sleepTimerEnd: number | null;
  sleepTimerInterval?: ReturnType<typeof setInterval> | null;
  skipSilence: boolean;
}

export interface UIState {
  sheetMode: 'hidden' | 'full';
  isTransitioning: boolean;
  isImmersive: boolean;
}

export interface UnifiedPlayerState {
  playback: PlaybackState;
  queue: QueueState;
  loading: LoadingState;
  error: ErrorState;
  settings: PlaybackSettings;
  ui: UIState;
}

export type PlayerAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SKIP_NEXT' }
  | { type: 'SKIP_PREVIOUS' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_RATE'; payload: number }
  | { type: 'SET_REPEAT_MODE'; payload: PlaybackSettings['repeatMode'] }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_SLEEP_TIMER'; payload: number }
  | { type: 'TOGGLE_SKIP_SILENCE' };

export interface PlayerColors {
  primary: string;
  secondary: string;
  text: string;
  gradient: string[];
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
}

export interface CachedReciterColors {
  primary: string;
  secondary: string;
  timestamp: number;
}

export const CACHE_DURATION = 24 * 60 * 60 * 1000;
