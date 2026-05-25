const ADHKAR_AUDIO_CDN = "https://cdn.thebayaan.com/adkhar";

/** Resolve a bundled dhikr filename (e.g. `adhkar_75.mp3`) to the CDN URL. */
export function adhkarAudioUrl(audioFile: string | null | undefined): string | null {
  if (!audioFile) return null;
  return `${ADHKAR_AUDIO_CDN}/${audioFile}`;
}
