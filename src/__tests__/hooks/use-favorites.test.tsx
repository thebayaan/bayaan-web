import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("useFavoriteReciters", () => {
  it("isFavoriteReciter reflects cache contents", async () => {
    server.use(
      http.get(`${API}/bayaan/user/favorite-reciters`, () =>
        HttpResponse.json({
          data: [
            {
              id: "fav-1",
              reciter_id: "reciter-A",
              created_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
    );
    const { result } = renderHook(() => useFavoriteReciters(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFavoriteReciter("reciter-A")).toBe(true);
    expect(result.current.isFavoriteReciter("reciter-B")).toBe(false);
  });

  it("toggleFavoriteReciter adds when missing and removes when present", async () => {
    let serverList: { reciter_id: string }[] = [];
    server.use(
      http.get(`${API}/bayaan/user/favorite-reciters`, () =>
        HttpResponse.json({
          data: serverList.map((f) => ({
            id: `fav-${f.reciter_id}`,
            reciter_id: f.reciter_id,
            created_at: "2025-01-01T00:00:00Z",
          })),
        }),
      ),
      http.post(`${API}/bayaan/user/favorite-reciters`, async ({ request }) => {
        const body = (await request.json()) as { reciter_id: string };
        serverList.push({ reciter_id: body.reciter_id });
        return HttpResponse.json({
          data: {
            id: `fav-${body.reciter_id}`,
            reciter_id: body.reciter_id,
            created_at: new Date().toISOString(),
          },
        });
      }),
      http.delete(`${API}/bayaan/user/favorite-reciters/:reciterId`, ({ params }) => {
        serverList = serverList.filter((f) => f.reciter_id !== params.reciterId);
        return HttpResponse.json({ data: { deleted: true } });
      }),
    );

    const { result } = renderHook(() => useFavoriteReciters(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleFavoriteReciter("reciter-X");
    });
    await waitFor(() => expect(result.current.isFavoriteReciter("reciter-X")).toBe(true));

    await act(async () => {
      await result.current.toggleFavoriteReciter("reciter-X");
    });
    await waitFor(() => expect(result.current.isFavoriteReciter("reciter-X")).toBe(false));
  });
});
