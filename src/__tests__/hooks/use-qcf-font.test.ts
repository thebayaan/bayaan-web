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

import { useQcfFont, _clearLoadedFontsForTesting } from "@/hooks/use-qcf-font";

describe("useQcfFont", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFontsSet.clear();
    _clearLoadedFontsForTesting();
  });

  it("loads font for a page number", async () => {
    renderHook(() => useQcfFont([1]));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledWith("p1-v2", expect.stringContaining("p1.woff2"));
  });

  it("returns loaded status", async () => {
    const { result } = renderHook(() => useQcfFont([1]));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(result.current.isPageFontLoaded(1)).toBe(true);
  });

  it("loads multiple pages", async () => {
    renderHook(() => useQcfFont([1, 2, 3]));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledTimes(3);
  });
});
