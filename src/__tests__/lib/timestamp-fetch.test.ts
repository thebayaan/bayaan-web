import { describe, it, expect } from "vitest";
import { findAyahTimestamp, rewayatHasTimestamps } from "@/lib/timestamp-fetch";
import type { AyahTimestamp } from "@/types/timestamps";

const sampleTimestamps: AyahTimestamp[] = [
  { verse_key: "1:1", timestamp_from: 0, timestamp_to: 6090 },
  { verse_key: "1:2", timestamp_from: 6090, timestamp_to: 11680 },
];

describe("rewayatHasTimestamps", () => {
  it("returns true when mp3quran_read_id is set", () => {
    expect(
      rewayatHasTimestamps({ id: "rw-1", mp3quran_read_id: 123, qdc_reciter_id: null }, 1),
    ).toBe(true);
  });

  it("respects timestamps_surah_list when provided", () => {
    expect(
      rewayatHasTimestamps(
        {
          id: "rw-1",
          mp3quran_read_id: null,
          qdc_reciter_id: null,
          has_timestamps: true,
          timestamps_surah_list: [2, 3],
        },
        1,
      ),
    ).toBe(false);
    expect(
      rewayatHasTimestamps(
        {
          id: "rw-1",
          mp3quran_read_id: null,
          qdc_reciter_id: null,
          has_timestamps: true,
          timestamps_surah_list: [2, 3],
        },
        2,
      ),
    ).toBe(true);
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
