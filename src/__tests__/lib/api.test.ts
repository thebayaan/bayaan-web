import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBayaan, fetchQuran, ApiError } from "@/lib/api";

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

  it("throws an ApiError with friendly status message when body is empty", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    });

    await expect(fetchBayaan("reciters")).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      code: null,
      message: expect.stringMatching(/server hit an error/i),
    });
  });

  it("uses the backend's structured code + message when present", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () =>
        Promise.resolve({
          error: { code: "USER_SYNC_FAILED", message: "Backend's own copy" },
        }),
    });

    await expect(fetchBayaan("user/playlists")).rejects.toMatchObject({
      status: 503,
      code: "USER_SYNC_FAILED",
      message: expect.stringMatching(/sync your account/i),
    });
  });

  it("falls back to backend message when code isn't in the friendly map", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: () =>
        Promise.resolve({
          error: { code: "VALIDATION", message: "Name must be at least 1 character" },
        }),
    });

    await expect(fetchBayaan("user/playlists")).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION",
      message: "Name must be at least 1 character",
    });
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

  it("throws an ApiError on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.reject(new Error("not json")),
    });

    const err = await fetchQuran("verses/by_chapter/999").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    if (!(err instanceof ApiError)) throw new Error("expected ApiError");
    expect(err.status).toBe(404);
    expect(err.message).toMatch(/couldn't find/i);
  });
});
