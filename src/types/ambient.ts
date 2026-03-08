export type AmbientSoundType =
  | 'rain'
  | 'forest'
  | 'ocean'
  | 'stream'
  | 'thunder'
  | 'fireplace'
  | 'wind';

export interface AmbientSoundMeta {
  label: string;
  icon: string;
  /** URL or path to the audio source (web-compatible) */
  source: string;
}

export const AMBIENT_SOUND_LIST: AmbientSoundType[] = [
  'rain',
  'forest',
  'ocean',
  'stream',
  'thunder',
  'fireplace',
  'wind',
];

export const DEFAULT_AMBIENT_VOLUME = 0.3;

export const AMBIENT_FADE_DURATION = 500;

export const AMBIENT_FADE_STEP = 25;
