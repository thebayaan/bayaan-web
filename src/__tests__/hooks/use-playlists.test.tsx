import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { usePlaylists } from "@/hooks/use-playlists";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

const API = "http://localhost:3000/api";

describe("usePlaylists", () => {
  it("creates a playlist and refreshes the list", async () => {
    let listed = false;
    server.use(
      http.get(`${API}/bayaan/user/playlists`, () => {
        listed = true;
        return HttpResponse.json({
          data: [
            {
              id: "existing",
              name: "Existing",
              is_public: false,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        });
      }),
    );

    const { result } = renderHook(() => usePlaylists(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listed).toBe(true);

    await act(async () => {
      const created = await result.current.createPlaylist({ name: "New" });
      expect(created.name).toBe("New");
    });
  });

  it("optimistically removes a playlist on delete", async () => {
    server.use(
      http.get(`${API}/bayaan/user/playlists`, () =>
        HttpResponse.json({
          data: [
            {
              id: "gone",
              name: "Doomed",
              is_public: false,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "kept",
              name: "Keeper",
              is_public: false,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
    );

    const { result } = renderHook(() => usePlaylists(), { wrapper });
    await waitFor(() => expect(result.current.playlists).toHaveLength(2));

    await act(async () => {
      await result.current.deletePlaylist("gone");
    });

    expect(result.current.playlists.map((p) => p.id)).toEqual(["kept"]);
  });

  it("rolls back optimistic delete when the network call fails", async () => {
    server.use(
      http.get(`${API}/bayaan/user/playlists`, () =>
        HttpResponse.json({
          data: [
            {
              id: "sticky",
              name: "Sticky",
              is_public: false,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
      http.delete(`${API}/bayaan/user/playlists/sticky`, () =>
        HttpResponse.json({ error: "nope" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => usePlaylists(), { wrapper });
    await waitFor(() => expect(result.current.playlists).toHaveLength(1));

    await expect(
      act(async () => {
        await result.current.deletePlaylist("sticky");
      }),
    ).rejects.toThrow();

    await waitFor(() => expect(result.current.playlists).toHaveLength(1));
  });
});
