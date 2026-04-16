import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { AddToPlaylistButton } from "@/components/playlists/add-to-playlist";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("AddToPlaylistButton", () => {
  const item = {
    reciter_id: "r-1",
    rewayat_id: "rw-1",
    surah_id: 1,
  };

  beforeEach(() => {
    server.use(
      http.get(`${API}/bayaan/user/playlists`, () =>
        HttpResponse.json({
          data: [
            {
              id: "p-1",
              name: "Favorites",
              is_public: false,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      ),
    );
  });

  it("opens a dialog listing playlists on click", async () => {
    const user = userEvent.setup();
    render(<AddToPlaylistButton label="Add Al-Fatiha to a playlist" item={item} />, {
      wrapper,
    });
    await user.click(screen.getByRole("button", { name: /add al-fatiha/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(await screen.findByRole("button", { name: /favorites/i })).toBeInTheDocument();
  });

  it("posts to the API when a playlist is chosen and closes", async () => {
    const user = userEvent.setup();
    let posted: unknown = null;
    server.use(
      http.post(`${API}/bayaan/user/playlists/p-1/items`, async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json({
          data: {
            id: "item-1",
            playlist_id: "p-1",
            reciter_id: item.reciter_id,
            rewayat_id: item.rewayat_id,
            surah_id: item.surah_id,
            position: 0,
            created_at: new Date().toISOString(),
          },
        });
      }),
    );
    render(<AddToPlaylistButton label="Add Al-Fatiha to a playlist" item={item} />, {
      wrapper,
    });
    await user.click(screen.getByRole("button", { name: /add al-fatiha/i }));
    await user.click(await screen.findByRole("button", { name: /favorites/i }));

    await waitFor(() => {
      expect(posted).toEqual(item);
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows an error and keeps the dialog open on failure", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API}/bayaan/user/playlists/p-1/items`, () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );
    render(<AddToPlaylistButton label="Add Al-Fatiha to a playlist" item={item} />, {
      wrapper,
    });
    await user.click(screen.getByRole("button", { name: /add al-fatiha/i }));
    await user.click(await screen.findByRole("button", { name: /favorites/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Bayaan API error/i);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
