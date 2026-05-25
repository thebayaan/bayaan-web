const WORD_AUDIO_CDN = "https://audio.qurancdn.com";

/** Resolve a QuranCDN word-by-word audio path (e.g. `wbw/001_001_001.mp3`). */
export function buildWordAudioUrl(audioUrl: string): string {
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    return audioUrl;
  }
  const path = audioUrl.startsWith("/") ? audioUrl.slice(1) : audioUrl;
  return `${WORD_AUDIO_CDN}/${path}`;
}
