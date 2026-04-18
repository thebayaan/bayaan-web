import { describe, it, expect } from "vitest";
import {
  verseShareUrl,
  surahShareUrl,
  reciterShareUrl,
  recitationShareUrl,
  mushafShareUrl,
  adhkarShareUrl,
  dhikrShareUrl,
} from "@/lib/share-urls";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.thebayaan.com";

describe("share-urls", () => {
  it("verseShareUrl builds /quran/{surah}/{ayah}", () => {
    expect(verseShareUrl(2, 255)).toBe(`${BASE}/quran/2/255`);
  });

  it("surahShareUrl builds /quran/{surah} without ayah", () => {
    expect(surahShareUrl(36)).toBe(`${BASE}/quran/36`);
  });

  it("surahShareUrl builds /quran/{surah}?v={ayah} when ayah passed", () => {
    expect(surahShareUrl(36, 7)).toBe(`${BASE}/quran/36?v=7`);
  });

  it("reciterShareUrl builds /reciter/{slug}", () => {
    expect(reciterShareUrl("mishary-rashid-alafasy")).toBe(
      `${BASE}/reciter/mishary-rashid-alafasy`,
    );
  });

  it("recitationShareUrl builds /reciter/{slug}/{surah} without opts", () => {
    expect(recitationShareUrl("mishary", 36)).toBe(`${BASE}/reciter/mishary/36`);
  });

  it("recitationShareUrl appends rewayah when provided", () => {
    expect(recitationShareUrl("mishary", 36, { rewayah: "hafs" })).toBe(
      `${BASE}/reciter/mishary/36?rewayah=hafs`,
    );
  });

  it("recitationShareUrl appends t when provided", () => {
    expect(recitationShareUrl("mishary", 36, { tSec: 42 })).toBe(`${BASE}/reciter/mishary/36?t=42`);
  });

  it("recitationShareUrl combines rewayah and t", () => {
    expect(recitationShareUrl("mishary", 36, { rewayah: "hafs", tSec: 42 })).toBe(
      `${BASE}/reciter/mishary/36?rewayah=hafs&t=42`,
    );
  });

  it("mushafShareUrl builds /mushaf/{page}", () => {
    expect(mushafShareUrl(255)).toBe(`${BASE}/mushaf/255`);
  });

  it("mushafShareUrl appends ?theme=light when light", () => {
    expect(mushafShareUrl(255, "light")).toBe(`${BASE}/mushaf/255?theme=light`);
  });

  it("adhkarShareUrl builds /adhkar/{superId}", () => {
    expect(adhkarShareUrl("morning")).toBe(`${BASE}/adhkar/morning`);
  });

  it("dhikrShareUrl builds /adhkar/{superId}/{dhikrId}", () => {
    expect(dhikrShareUrl("morning", "d-1")).toBe(`${BASE}/adhkar/morning/d-1`);
  });
});
