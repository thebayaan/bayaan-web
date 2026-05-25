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

describe("GET /api/quran-v4/[...path]", () => {
  async function callRoute(path: string[], search = "") {
    const { GET } = await import("@/app/api/quran-v4/[...path]/route");
    const request = new NextRequest(
      `http://localhost:3000/api/quran-v4/${path.join("/")}${search}`,
    );
    return GET(request, { params: Promise.resolve({ path }) });
  }

  it("forwards path segments and query params to Quran.com v4", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ search: { results: [] } }), { status: 200 }),
    );

    const response = await callRoute(["search"], "?q=mercy&size=20");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ search: { results: [] } });

    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toBe("https://api.quran.com/api/v4/search?q=mercy&size=20");
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("preserves upstream error status codes", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "not found" }), { status: 404 }),
    );

    const response = await callRoute(["chapters", "999"]);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not found" });
  });

  it("joins nested path segments", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await callRoute(["tafsirs", "169", "by_ayah", "2:255"]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://api.quran.com/api/v4/tafsirs/169/by_ayah/2:255",
    );
  });
});
