import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  _clearTajweedV4PalettesForTesting,
  ensureTajweedV4FontPalettes,
  getTajweedV4FontPalette,
} from "@/lib/tajweed-v4-palettes";
import { createMushafFontResolver, getMushafFontConfig } from "@/lib/mushaf-fonts";

describe("tajweed-v4-palettes", () => {
  beforeEach(() => {
    _clearTajweedV4PalettesForTesting();
  });

  afterEach(() => {
    _clearTajweedV4PalettesForTesting();
  });

  it("returns per-page palette names for each theme", () => {
    expect(getTajweedV4FontPalette("p2-v4", "dark")).toBe("--Dark-p2-v4");
    expect(getTajweedV4FontPalette("p2-v4", "light")).toBe("--Light-p2-v4");
    expect(getTajweedV4FontPalette("p2-v4", "sepia")).toBe("--Sepia-p2-v4");
  });

  it("injects palette CSS for each page font family once", () => {
    ensureTajweedV4FontPalettes("p2-v4");
    ensureTajweedV4FontPalettes("p2-v4");

    const styles = document.querySelectorAll("style[data-tajweed-v4-palette='p2-v4']");
    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain("--Dark-p2-v4");
  });
});

describe("createMushafFontResolver tajweed palettes", () => {
  it("exposes page-specific palettes for Tajweed V4", () => {
    const config = getMushafFontConfig("qcf_tajweed_v4");
    const resolver = createMushafFontResolver(
      config,
      {
        isPageFontLoaded: () => true,
        getFontFamily: () => "p2-v4",
        isStaticFontLoaded: true,
      },
      { tajweedTheme: "dark" },
    );

    expect(resolver.getPageFontPalette?.(2)).toBe("--Dark-p2-v4");
  });
});
