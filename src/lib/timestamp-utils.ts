import type { AyahTimestamp } from "@/types/timestamps";

/** O(log n) search for the ayah containing a playback position (ms). */
export function binarySearchAyah(
  timestamps: AyahTimestamp[],
  positionMs: number,
): AyahTimestamp | null {
  if (timestamps.length === 0) return null;
  if (positionMs < timestamps[0]!.timestamp_from) return null;

  let low = 0;
  let high = timestamps.length - 1;
  let result: AyahTimestamp | null = null;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const entry = timestamps[mid]!;
    if (entry.timestamp_from <= positionMs) {
      result = entry;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}
