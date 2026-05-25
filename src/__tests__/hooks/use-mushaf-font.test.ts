import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockFontsSet = new Set<unknown>();
vi.stubGlobal(
  "FontFace",
  vi.fn(function (family: string) {
    return {
      family,
      load: vi.fn().mockResolvedValue(undefined),
      status: "loaded",
    };
  }),
);
Object.defineProperty(document, "fonts", {
  value: {
    add: vi.fn((ff: unknown) => mockFontsSet.add(ff)),
    has: vi.fn(() => false),
    check: vi.fn(() => false),
  },
  writable: true,
});

import { useMushafFont, useQcfFont, _clearLoadedFontsForTesting } from "@/hooks/use-mushaf-font";

describe("useMushafFont", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFontsSet.clear();
    _clearLoadedFontsForTesting();
  });

  it("loads QCF V2 font for a page number", async () => {
    renderHook(() => useQcfFont([1]));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledWith("p1-v2", expect.stringContaining("p1.woff2"));
  });

  it("loads QCF V1 font when selected", async () => {
    renderHook(() => useMushafFont([1], "qcf_v1"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledWith("p1-v1", expect.stringContaining("/v1/woff2/p1.woff2"));
  });

  it("loads IndoPak static font when selected", async () => {
    renderHook(() => useMushafFont([1], "indopak"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledWith("IndoPak", expect.stringContaining("indopak-nastaleeq"));
  });

  it("returns loaded status for glyph fonts", async () => {
    const { result } = renderHook(() => useMushafFont([1], "qcf_v2"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(result.current.isPageFontLoaded(1)).toBe(true);
  });

  it("loads multiple pages", async () => {
    renderHook(() => useMushafFont([1, 2, 3], "qcf_v2"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledTimes(3);
  });
});
