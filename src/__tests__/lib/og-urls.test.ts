import { describe, it, expect } from "vitest";
import {
  ogRootUrl,
  ogVerseUrl,
  ogSurahUrl,
  ogReciterUrl,
  ogRecitationUrl,
  ogMushafUrl,
  ogAdhkarUrl,
  ogDhikrUrl,
} from "@/lib/og-urls";

const API = process.env.NEXT_PUBLIC_BAYAAN_API_URL ?? "https://api.thebayaan.com";
const OG = `${API}/og`;

describe("og-urls", () => {
  it("ogRootUrl returns /og/root.png", () => {
    expect(ogRootUrl()).toBe(`${OG}/root.png`);
  });

  it("ogVerseUrl returns /og/verse/{s}/{a}.png", () => {
    expect(ogVerseUrl(2, 255)).toBe(`${OG}/verse/2/255.png`);
  });

  it("ogSurahUrl returns /og/surah/{s}.png", () => {
    expect(ogSurahUrl(36)).toBe(`${OG}/surah/36.png`);
  });

  it("ogReciterUrl returns /og/reciter/{slug}.png", () => {
    expect(ogReciterUrl("mishary")).toBe(`${OG}/reciter/mishary.png`);
  });

  it("ogRecitationUrl without rewayah", () => {
    expect(ogRecitationUrl("mishary", 36)).toBe(`${OG}/recitation/mishary/36.png`);
  });

  it("ogRecitationUrl with rewayah as query", () => {
    expect(ogRecitationUrl("mishary", 36, "hafs")).toBe(
      `${OG}/recitation/mishary/36.png?rewayah=hafs`,
    );
  });

  it("ogMushafUrl returns /og/mushaf/{page}.png", () => {
    expect(ogMushafUrl(255)).toBe(`${OG}/mushaf/255.png`);
  });

  it("ogAdhkarUrl returns /og/adhkar/{id}.png", () => {
    expect(ogAdhkarUrl("morning")).toBe(`${OG}/adhkar/morning.png`);
  });

  it("ogDhikrUrl returns /og/dhikr/{sid}/{did}.png", () => {
    expect(ogDhikrUrl("morning", "d-1")).toBe(`${OG}/dhikr/morning/d-1.png`);
  });
});
