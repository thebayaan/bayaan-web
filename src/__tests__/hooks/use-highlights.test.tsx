import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useHighlights } from "@/hooks/use-highlights";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("useHighlights", () => {
  it("getHighlight returns the stored color", async () => {
    server.use(
      http.get(`${API}/bayaan/user/highlights`, () =>
        HttpResponse.json({
          data: [
            {
              id: "h1",
              user_id: "u",
              verse_key: "2:255",
              color: "green",
              created_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
    );
    const { result } = renderHook(() => useHighlights(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.getHighlight("2:255")?.color).toBe("green");
    expect(result.current.getHighlight("1:1")).toBeUndefined();
  });

  it("setHighlight optimistically updates then POSTs", async () => {
    let posted: unknown = null;
    server.use(
      http.get(`${API}/bayaan/user/highlights`, () => HttpResponse.json({ data: [] })),
      http.post(`${API}/bayaan/user/highlights`, async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json({
          data: {
            id: "h-1",
            user_id: "u",
            verse_key: "1:1",
            color: "yellow",
            created_at: new Date().toISOString(),
          },
        });
      }),
    );
    const { result } = renderHook(() => useHighlights(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.setHighlight("1:1", "yellow");
    });
    expect(posted).toEqual({ verse_key: "1:1", color: "yellow" });
  });

  it("removeHighlight DELETEs and clears from cache", async () => {
    let deleted = false;
    server.use(
      http.get(`${API}/bayaan/user/highlights`, () =>
        HttpResponse.json({
          data: [
            {
              id: "h1",
              user_id: "u",
              verse_key: "2:255",
              color: "blue",
              created_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
      http.delete(`${API}/bayaan/user/highlights/:verseKey`, () => {
        deleted = true;
        return HttpResponse.json({ data: { deleted: true } });
      }),
    );
    const { result } = renderHook(() => useHighlights(), { wrapper });
    await waitFor(() => expect(result.current.highlights).toHaveLength(1));
    await act(async () => {
      await result.current.removeHighlight("2:255");
    });
    expect(deleted).toBe(true);
    expect(result.current.getHighlight("2:255")).toBeUndefined();
  });
});
