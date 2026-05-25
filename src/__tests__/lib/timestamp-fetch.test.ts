import { describe, it, expect } from "vitest";
import { findAyahTimestamp, rewayatHasTimestamps } from "@/lib/timestamp-fetch";
import type { AyahTimestamp } from "@/types/timestamps";

const sampleTimestamps: AyahTimestamp[] = [
  { verse_key: "1:1", timestamp_from: 0, timestamp_to: 6090 },
  { verse_key: "1:2", timestamp_from: 6090, timestamp_to: 11680 },
];

describe("rewayatHasTimestamps", () => {
  it("returns false when has_timestamps is false or missing", () => {
    expect(rewayatHasTimestamps({ id: "rw-1", has_timestamps: false }, 1)).toBe(false);
    expect(rewayatHasTimestamps({ id: "rw-1" }, 1)).toBe(false);
  });

  it("returns true for any surah when has_timestamps is true and the surah_list is absent or empty", () => {
    expect(rewayatHasTimestamps({ id: "rw-1", has_timestamps: true }, 1)).toBe(true);
    expect(
      rewayatHasTimestamps({ id: "rw-1", has_timestamps: true, timestamps_surah_list: [] }, 50),
    ).toBe(true);
  });

  it("respects timestamps_surah_list as a per-surah whitelist when present", () => {
    const rewayat = {
      id: "rw-1",
      has_timestamps: true,
      timestamps_surah_list: [2, 3],
    };
    expect(rewayatHasTimestamps(rewayat, 1)).toBe(false);
    expect(rewayatHasTimestamps(rewayat, 2)).toBe(true);
    expect(rewayatHasTimestamps(rewayat, 3)).toBe(true);
    expect(rewayatHasTimestamps(rewayat, 4)).toBe(false);
  });
});

describe("findAyahTimestamp", () => {
  it("finds a timestamp by surah and ayah number", () => {
    expect(findAyahTimestamp(sampleTimestamps, 1, 2)).toEqual(sampleTimestamps[1]);
  });

  it("returns undefined when ayah is missing", () => {
    expect(findAyahTimestamp(sampleTimestamps, 1, 99)).toBeUndefined();
  });
});
