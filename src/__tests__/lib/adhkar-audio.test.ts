import { describe, it, expect } from "vitest";
import { adhkarAudioUrl } from "@/lib/adhkar-audio";
import { getDhikrById, getDhikrPlaybackUrl } from "@/data/adhkar-data";

describe("adhkar-audio", () => {
  it("builds CDN URLs from bundled filenames", () => {
    expect(adhkarAudioUrl("adhkar_1.mp3")).toBe("https://cdn.thebayaan.com/adkhar/adhkar_1.mp3");
    expect(adhkarAudioUrl("adhkar_406.mp3")).toBe(
      "https://cdn.thebayaan.com/adkhar/adhkar_406.mp3",
    );
  });

  it("returns null for missing filenames", () => {
    expect(adhkarAudioUrl(null)).toBeNull();
    expect(adhkarAudioUrl("")).toBeNull();
  });

  it("resolves playback URLs for known dhikr", () => {
    const dhikr = getDhikrById("75");
    expect(dhikr).toBeDefined();
    expect(getDhikrPlaybackUrl(dhikr!)).toBe("https://cdn.thebayaan.com/adkhar/adhkar_75.mp3");
  });

  it("covers Names of Allah clips on CDN", () => {
    const dhikr = getDhikrById("name-1");
    expect(dhikr).toBeDefined();
    expect(getDhikrPlaybackUrl(dhikr!)).toBe("https://cdn.thebayaan.com/adkhar/adhkar_308.mp3");
  });
});
