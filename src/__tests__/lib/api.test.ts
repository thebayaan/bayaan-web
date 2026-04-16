import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBayaan, fetchQuran } from "@/lib/api";

describe("fetchBayaan", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct proxy URL", async () => {
    const mockResponse = { data: "test" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchBayaan("reciters");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bayaan/reciters"),
      undefined,
    );
    expect(result).toEqual(mockResponse);
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchBayaan("reciters")).rejects.toThrow("Bayaan API error: 500");
  });
});

describe("fetchQuran", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct proxy URL with params", async () => {
    const mockResponse = { verses: [] };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await fetchQuran("verses/by_chapter/1", { per_page: "10" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/quran/verses/by_chapter/1?per_page=10"),
    );
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchQuran("verses/by_chapter/999")).rejects.toThrow("Quran API error: 404");
  });
});
