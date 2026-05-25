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

  it("proxies timestamps from Bayaan when available", async () => {
    const payload = {
      data: {
        rewayat_id: "rw-1",
        surah: 1,
        timestamps: [{ verse_key: "1:1", timestamp_from: 0, timestamp_to: 1000 }],
      },
    };
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }));

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/timestamps/rw-1/1"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringContaining("Bearer") }),
      }),
    );
  });

  it("falls back to external timestamp sources when Bayaan returns 404", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "rw-1",
              mp3quran_read_id: 11,
              qdc_reciter_id: null,
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ ayah: 1, start_time: 0, end_time: 5000 }]), { status: 200 }),
      );

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.timestamps).toEqual([{ verse_key: "1:1", timestamp_from: 0, timestamp_to: 5000 }]);
  });

  it("returns 404 when rewayat is not found", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    const response = await callRoute("missing", "1");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Rewayat not found" });
  });

  it("returns 404 when no timestamps are available from fallback", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "rw-1", mp3quran_read_id: null, qdc_reciter_id: null } }), {
          status: 200,
        }),
      );

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "No timestamps available" });
  });

  it("returns 502 when upstream throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("upstream down"));

    const response = await callRoute("rw-1", "1");
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "upstream down" });
  });
});
