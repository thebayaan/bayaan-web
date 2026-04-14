import { describe, it, expect } from "vitest";
import type { Reciter, Rewayat } from "@/types/reciter";
import type { Track } from "@/types/audio";
import type { Surah, AyahTimestamp } from "@/types/quran";

describe("type contracts", () => {
  it("Reciter has required fields", () => {
    const reciter: Reciter = {
      id: "abc-123",
      name: "Mishary Alafasy",
      slug: "mishary-alafasy",
      is_featured: true,
      rewayat: [],
    };
    expect(reciter.id).toBe("abc-123");
    expect(reciter.rewayat).toHaveLength(0);
  });

  it("Rewayat has required fields", () => {
    const rewayat: Rewayat = {
      id: "rw-1",
      reciter_id: "abc-123",
      name: "Hafs A'n Assem",
      style: "murattal",
      server:
        "https://cdn.thebayaan.com/quran/recitations/mishary-alafasy/hafs/murattal/default",
      source_type: "bayaan",
      surah_total: 114,
      surah_list: [1, 2, 3],
      mp3quran_read_id: 12,
      qdc_reciter_id: null,
    };
    expect(rewayat.style).toBe("murattal");
    expect(rewayat.surah_list).toContain(1);
  });

  it("Track has all audio metadata", () => {
    const track: Track = {
      id: "t-1",
      url: "https://cdn.thebayaan.com/quran/recitations/test/001.mp3",
      title: "Al-Fatiha",
      artist: "Mishary Alafasy",
      artwork: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
      duration: 60000,
      reciterId: "abc-123",
      reciterName: "Mishary Alafasy",
      surahId: 1,
      rewayatId: "rw-1",
    };
    expect(track.url).toContain("cdn.thebayaan.com");
  });

  it("AyahTimestamp has timing data", () => {
    const ts: AyahTimestamp = {
      surah_number: 1,
      ayah_number: 1,
      timestamp_from: 0,
      timestamp_to: 5000,
      duration_ms: 5000,
    };
    expect(ts.duration_ms).toBe(ts.timestamp_to - ts.timestamp_from);
  });
});
