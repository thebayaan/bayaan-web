import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useNotes } from "@/hooks/use-notes";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("useNotes", () => {
  it("upsertNote POSTs when note doesn't exist", async () => {
    let method: string | null = null;
    server.use(
      http.get(`${API}/bayaan/user/notes`, () => HttpResponse.json({ data: [] })),
      http.post(`${API}/bayaan/user/notes`, async ({ request }) => {
        method = request.method;
        return HttpResponse.json({
          data: {
            id: "n-1",
            user_id: "u",
            verse_key: "1:1",
            content: "hello",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      }),
    );
    const { result } = renderHook(() => useNotes(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.upsertNote("1:1", "hello");
    });
    expect(method).toBe("POST");
  });

  it("upsertNote PUTs when note already exists", async () => {
    let putHit = false;
    server.use(
      http.get(`${API}/bayaan/user/notes`, () =>
        HttpResponse.json({
          data: [
            {
              id: "n-1",
              user_id: "u",
              verse_key: "1:1",
              content: "old",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
      http.put(`${API}/bayaan/user/notes/:verseKey`, () => {
        putHit = true;
        return HttpResponse.json({
          data: {
            id: "n-1",
            user_id: "u",
            verse_key: "1:1",
            content: "new",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: new Date().toISOString(),
          },
        });
      }),
    );
    const { result } = renderHook(() => useNotes(), { wrapper });
    await waitFor(() => expect(result.current.notes).toHaveLength(1));
    await act(async () => {
      await result.current.upsertNote("1:1", "new");
    });
    expect(putHit).toBe(true);
  });
});
