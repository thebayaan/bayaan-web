import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("useBookmarks", () => {
  it("isBookmarked reflects cache contents", async () => {
    server.use(
      http.get(`${API}/bayaan/user/bookmarks`, () =>
        HttpResponse.json({
          data: [
            {
              id: "b1",
              user_id: "u",
              verse_key: "2:255",
              surah_number: 2,
              ayah_number: 255,
              created_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
    );
    const { result } = renderHook(() => useBookmarks(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isBookmarked("2:255")).toBe(true);
    expect(result.current.isBookmarked("1:1")).toBe(false);
  });

  it("toggleBookmark adds when missing and removes when present", async () => {
    let serverList: { verse_key: string }[] = [];
    server.use(
      http.get(`${API}/bayaan/user/bookmarks`, () =>
        HttpResponse.json({
          data: serverList.map((b) => ({
            id: `b-${b.verse_key}`,
            user_id: "u",
            verse_key: b.verse_key,
            surah_number: 1,
            ayah_number: 1,
            created_at: "2025-01-01T00:00:00Z",
          })),
        }),
      ),
      http.post(`${API}/bayaan/user/bookmarks`, async ({ request }) => {
        const body = (await request.json()) as { verse_key: string };
        serverList.push({ verse_key: body.verse_key });
        return HttpResponse.json({
          data: {
            id: `b-${body.verse_key}`,
            user_id: "u",
            surah_number: 1,
            ayah_number: 1,
            created_at: new Date().toISOString(),
            verse_key: body.verse_key,
          },
        });
      }),
      http.delete(`${API}/bayaan/user/bookmarks/:verseKey`, ({ params }) => {
        serverList = serverList.filter((b) => b.verse_key !== params.verseKey);
        return HttpResponse.json({ data: { deleted: true } });
      }),
    );

    const { result } = renderHook(() => useBookmarks(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleBookmark({
        verse_key: "1:1",
        surah_number: 1,
        ayah_number: 1,
      });
    });
    await waitFor(() => expect(result.current.isBookmarked("1:1")).toBe(true));

    await act(async () => {
      await result.current.toggleBookmark({
        verse_key: "1:1",
        surah_number: 1,
        ayah_number: 1,
      });
    });
    await waitFor(() => expect(result.current.isBookmarked("1:1")).toBe(false));
  });
});
