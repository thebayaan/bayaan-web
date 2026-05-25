import { describe, it, expect, beforeEach } from "vitest";
import { removePlaylistItem } from "@/hooks/use-playlist";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

describe("removePlaylistItem", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("removes the item from the local store", async () => {
    const playlist = useLibraryStore.getState().createPlaylist({ name: "Test" });
    const item = useLibraryStore.getState().addPlaylistItem(playlist.id, {
      reciter_id: "r-1",
      rewayat_id: "rw-1",
      surah_id: 1,
    });

    await removePlaylistItem(playlist.id, item.id);

    expect(
      useLibraryStore.getState().playlistItems.filter((entry) => entry.playlist_id === playlist.id),
    ).toHaveLength(0);
  });
});
