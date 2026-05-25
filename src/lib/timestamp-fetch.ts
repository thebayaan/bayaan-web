import type { AyahTimestamp, RewayatRef } from "@/types/timestamps";

/**
 * Returns true if the rewayat has timestamp coverage for this surah.
 *
 * Reads the static `has_timestamps` flag set by the R2 mirror script on
 * the bayaan-backend (see backend PR #18). When `timestamps_surah_list`
 * is present it's a per-surah whitelist; when absent, `has_timestamps`
 * implies all 114 surahs are covered.
 */
export function rewayatHasTimestamps(rewayat: RewayatRef, surah: number): boolean {
  if (!rewayat.has_timestamps) return false;
  if (!rewayat.timestamps_surah_list?.length) return true;
  return rewayat.timestamps_surah_list.includes(surah);
}

export function findAyahTimestamp(
  timestamps: AyahTimestamp[],
  surah: number,
  ayah: number,
): AyahTimestamp | undefined {
  const verseKey = `${surah}:${ayah}`;
  return timestamps.find((entry) => entry.verse_key === verseKey);
}
