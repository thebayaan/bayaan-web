/**
 * Format a millisecond duration as `m:ss` for durations under an hour
 * and `h:mm:ss` once it crosses an hour. Keeps short tracks tight
 * while still reading cleanly for full-surah recitations.
 */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}
