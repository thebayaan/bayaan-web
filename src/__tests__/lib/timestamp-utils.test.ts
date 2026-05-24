import { describe, expect, it } from "vitest";
import { binarySearchAyah } from "@/lib/timestamp-utils";
import type { AyahTimestamp } from "@/types/timestamps";

const TIMESTAMPS: AyahTimestamp[] = [
  { verse_key: "1:1", timestamp_from: 0, timestamp_to: 5000 },
  { verse_key: "1:2", timestamp_from: 5000, timestamp_to: 12000 },
  { verse_key: "1:3", timestamp_from: 12000, timestamp_to: 20000 },
  { verse_key: "1:4", timestamp_from: 20000, timestamp_to: 28000 },
];

describe("binarySearchAyah", () => {
  it("returns null for empty timestamps", () => {
    expect(binarySearchAyah([], 1000)).toBeNull();
  });

  it("returns null before the first ayah starts", () => {
    expect(binarySearchAyah(TIMESTAMPS, -1)).toBeNull();
  });

  it("finds the ayah at exact start boundaries", () => {
    expect(binarySearchAyah(TIMESTAMPS, 0)?.verse_key).toBe("1:1");
    expect(binarySearchAyah(TIMESTAMPS, 5000)?.verse_key).toBe("1:2");
    expect(binarySearchAyah(TIMESTAMPS, 12000)?.verse_key).toBe("1:3");
  });

  it("finds the ayah for positions inside an ayah window", () => {
    expect(binarySearchAyah(TIMESTAMPS, 2500)?.verse_key).toBe("1:1");
    expect(binarySearchAyah(TIMESTAMPS, 8000)?.verse_key).toBe("1:2");
    expect(binarySearchAyah(TIMESTAMPS, 15000)?.verse_key).toBe("1:3");
  });

  it("returns the last ayah for positions after its start", () => {
    expect(binarySearchAyah(TIMESTAMPS, 25000)?.verse_key).toBe("1:4");
    expect(binarySearchAyah(TIMESTAMPS, 999999)?.verse_key).toBe("1:4");
  });
});
