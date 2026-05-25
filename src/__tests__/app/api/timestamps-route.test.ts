import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { server } from "@/__tests__/mocks/server";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
  server.close();
  fetchMock.mockReset();
});

afterAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

describe("GET /api/timestamps/[rewayatId]/[surah]", () => {
  async function callRoute(rewayatId: string, surah: string) {
    const { GET } = await import("@/app/api/timestamps/[rewayatId]/[surah]/route");
    const request = new NextRequest(`http://localhost:3000/api/timestamps/${rewayatId}/${surah}`);
    return GET(request, { params: Promise.resolve({ rewayatId, surah }) });
  }

  it("returns 400 for invalid surah", async () => {
    const response = await callRoute("rw-1", "0");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid rewayat or surah" });
  });

  it("returns 400 for non-integer surah", async () => {
    const response = await callRoute("rw-1", "abc");
    expect(response.status).toBe(400);
  });

  it("normalizes the R2 CDN camelCase payload", async () => {
    const cdnPayload = [
      {
        surahNumber: 1,
        ayahNumber: 2,
        timestampFrom: 6800,
        timestampTo: 11700,
        durationMs: 4900,
      },
    ];
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(cdnPayload), { status: 200 }));

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        rewayat_id: "rw-1",
        surah: 1,
        timestamps: [{ verse_key: "1:2", timestamp_from: 6800, timestamp_to: 11700 }],
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://cdn.thebayaan.com/timestamps/rw-1/001.json",
      expect.objectContaining({ next: { revalidate: 86400 } }),
    );
  });

  it("passes through already-normalized CDN rows", async () => {
    const timestamps = [{ verse_key: "1:1", timestamp_from: 0, timestamp_to: 1000 }];
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(timestamps), { status: 200 }));

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { rewayat_id: "rw-1", surah: 1, timestamps },
    });
  });

  it("falls back to MP3Quran when the CDN has no JSON for this rewayat/surah", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "rw-1",
              mp3quran_read_id: 49,
              qdc_reciter_id: null,
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([{ ayah: 2, start_time: 6800, end_time: 11700 }]),
          { status: 200 },
        ),
      );

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        rewayat_id: "rw-1",
        surah: 1,
        timestamps: [{ verse_key: "1:2", timestamp_from: 6800, timestamp_to: 11700 }],
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns 404 when CDN and fallback both fail", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    const response = await callRoute("missing", "1");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "No timestamps available" });
  });

  it("returns 502 when the CDN throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("upstream down"));

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "upstream down" });
  });

  it("falls back when the CDN returns a non-array payload", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ not: "an array" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "rw-1",
              mp3quran_read_id: 49,
              qdc_reciter_id: null,
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([{ ayah: 1, start_time: 0, end_time: 1000 }]),
          { status: 200 },
        ),
      );

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        rewayat_id: "rw-1",
        surah: 1,
        timestamps: [{ verse_key: "1:1", timestamp_from: 0, timestamp_to: 1000 }],
      },
    });
  });
});
