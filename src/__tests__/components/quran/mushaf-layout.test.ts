import { describe, it, expect } from "vitest";
import {
  getMushafFontScale,
  MUSHAF_DESIGN_FONT_SIZE_REM,
} from "@/components/quran/mushaf-layout";

describe("getMushafFontScale", () => {
  it("keeps glyph mushaf lines at the design font size and scales the page", () => {
    expect(getMushafFontScale(2.4, "glyph-per-page")).toEqual({
      scale: 2.4 / MUSHAF_DESIGN_FONT_SIZE_REM,
      renderFontSizeRem: MUSHAF_DESIGN_FONT_SIZE_REM,
    });
  });

  it("returns unit scale at the default font size", () => {
    expect(getMushafFontScale(MUSHAF_DESIGN_FONT_SIZE_REM, "glyph-per-page")).toEqual({
      scale: 1,
      renderFontSizeRem: MUSHAF_DESIGN_FONT_SIZE_REM,
    });
  });

  it("passes unicode font sizes through unchanged", () => {
    expect(getMushafFontScale(2.4, "unicode")).toEqual({
      scale: 1,
      renderFontSizeRem: 2.4,
    });
  });
});
