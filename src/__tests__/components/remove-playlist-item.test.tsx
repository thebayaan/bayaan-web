import { describe, it, expect } from "vitest";
import { removePlaylistItem } from "@/hooks/use-playlist";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

const API = "http://localhost:3000/api";

describe("removePlaylistItem", () => {
  it("DELETEs the correct playlist/item path", async () => {
    let captured: { playlistId: string; itemId: string } | null = null;
    server.use(
      http.delete(`${API}/bayaan/user/playlists/:playlistId/items/:itemId`, ({ params }) => {
        captured = {
          playlistId: String(params.playlistId),
          itemId: String(params.itemId),
        };
        return HttpResponse.json({ data: { deleted: true } });
      }),
    );

    await removePlaylistItem("p-1", "item-1");
    expect(captured).toEqual({ playlistId: "p-1", itemId: "item-1" });
  });

  it("propagates server errors so the UI can show a message", async () => {
    server.use(
      http.delete(`${API}/bayaan/user/playlists/:playlistId/items/:itemId`, () =>
        HttpResponse.json({ error: { message: "boom" } }, { status: 500 }),
      ),
    );
    await expect(removePlaylistItem("p-1", "item-1")).rejects.toThrow();
  });
});
