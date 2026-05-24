import { describe, it, expect } from "vitest";
import { processTajweedData } from "@/lib/tajweed-loader";

describe("processTajweedData", () => {
  it("parses nested rule tags into coloured segments", () => {
    const { byLocation } = processTajweedData({
      "1:1:2": {
        word_index: 2,
        location: "1:1:2",
        text: '<rule class=ham_wasl>ٱ</rule>للَّهِ',
      },
      "1:1:3": {
        word_index: 3,
        location: "1:1:3",
        text: '<rule class=ham_wasl>ٱ</rule><rule class=laam_shamsiyah>ل</rule>رَّحۡمَ<rule class=madda_normal>ـٰ</rule>نِ',
      },
    });

    expect(byLocation["1:1:2"]?.segments).toEqual([
      { text: "ٱ", rule: "ham_wasl" },
      { text: "للَّهِ", rule: null },
    ]);

    expect(byLocation["1:1:3"]?.segments).toEqual([
      { text: "ٱ", rule: "ham_wasl" },
      { text: "ل", rule: "laam_shamsiyah" },
      { text: "رَّحۡمَ", rule: null },
      { text: "ـٰ", rule: "madda_normal" },
      { text: "نِ", rule: null },
    ]);
  });

  it("indexes words by verse key in reading order", () => {
    const { indexed } = processTajweedData({
      "1:1:2": { word_index: 2, location: "1:1:2", text: "two" },
      "1:1:1": { word_index: 1, location: "1:1:1", text: "one" },
    });

    expect(indexed["1:1"]?.map((w) => w.location)).toEqual(["1:1:1", "1:1:2"]);
  });
});
