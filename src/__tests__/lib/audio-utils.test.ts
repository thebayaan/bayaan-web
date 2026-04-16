import { describe, it, expect } from "vitest";
import { buildAudioUrl, createTrack, createQueueFromSurah } from "@/lib/audio-utils";
import type { Reciter, Rewayat } from "@/types/reciter";

const mockRewayat: Rewayat = {
  id: "rw-1",
  reciter_id: "r-1",
  name: "Hafs",
  style: "murattal",
  server: "https://cdn.thebayaan.com/quran/recitations/mishary/hafs/murattal/default",
  source_type: "bayaan",
  surah_total: 114,
  surah_list: [1, 2, 3, 4, 5],
  mp3quran_read_id: 12,
  qdc_reciter_id: null,
};

const mockReciter: Reciter = {
  id: "r-1",
  name: "Mishary Alafasy",
  slug: "mishary-alafasy",
  image_url: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
  is_featured: true,
  rewayat: [mockRewayat],
};

describe("buildAudioUrl", () => {
  it("builds correct URL with zero-padded surah number", () => {
    expect(buildAudioUrl(mockRewayat.server, 1)).toBe(
      "https://cdn.thebayaan.com/quran/recitations/mishary/hafs/murattal/default/001.mp3",
    );
  });
  it("pads single-digit to 3 digits", () => {
    expect(buildAudioUrl(mockRewayat.server, 9)).toContain("/009.mp3");
  });
  it("pads double-digit to 3 digits", () => {
    expect(buildAudioUrl(mockRewayat.server, 36)).toContain("/036.mp3");
  });
  it("handles triple-digit", () => {
    expect(buildAudioUrl(mockRewayat.server, 114)).toContain("/114.mp3");
  });
});

describe("createTrack", () => {
  it("creates track with correct metadata", () => {
    const track = createTrack(mockReciter, mockRewayat, 1, "Al-Fatiha");
    expect(track.id).toBe("r-1:rw-1:1");
    expect(track.url).toContain("/001.mp3");
    expect(track.title).toBe("Al-Fatiha");
    expect(track.artist).toBe("Mishary Alafasy");
  });
});

describe("createQueueFromSurah", () => {
  it("creates queue starting from selected surah", () => {
    const names: Record<number, string> = {
      1: "Al-Fatiha",
      2: "Al-Baqarah",
      3: "Aal-E-Imran",
      4: "An-Nisa",
      5: "Al-Maidah",
    };
    const { tracks, startIndex } = createQueueFromSurah(mockReciter, mockRewayat, 3, names);
    expect(tracks).toHaveLength(5);
    expect(startIndex).toBe(0);
    expect(tracks[0]?.title).toBe("Aal-E-Imran");
    expect(tracks[4]?.title).toBe("Al-Baqarah");
  });
});
