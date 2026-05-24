import { describe, it, expect } from "vitest";
import { buildWordAudioUrl } from "@/lib/word-audio";

describe("buildWordAudioUrl", () => {
  it("prefixes relative wbw paths with the QuranCDN audio host", () => {
    expect(buildWordAudioUrl("wbw/001_001_001.mp3")).toBe(
      "https://audio.qurancdn.com/wbw/001_001_001.mp3",
    );
  });

  it("passes through absolute URLs unchanged", () => {
    const absolute = "https://cdn.example.com/word.mp3";
    expect(buildWordAudioUrl(absolute)).toBe(absolute);
  });

  it("strips a leading slash from relative paths", () => {
    expect(buildWordAudioUrl("/wbw/002_255_001.mp3")).toBe(
      "https://audio.qurancdn.com/wbw/002_255_001.mp3",
    );
  });
});
