import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddToPlaylistButton } from "@/components/playlists/add-to-playlist";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

describe("AddToPlaylistButton", () => {
  const item = {
    reciter_id: "r-1",
    rewayat_id: "rw-1",
    surah_id: 1,
  };

  beforeEach(() => {
    resetLibraryStore();
    useLibraryStore.getState().createPlaylist({ name: "Favorites" });
  });

  it("opens a dialog listing playlists on click", async () => {
    const user = userEvent.setup();
    render(<AddToPlaylistButton label="Add Al-Fatiha to a playlist" item={item} />);
    await user.click(screen.getByRole("button", { name: /add al-fatiha/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(await screen.findByRole("button", { name: /favorites/i })).toBeInTheDocument();
  });

  it("adds to the selected playlist and closes", async () => {
    const user = userEvent.setup();
    const playlistId = useLibraryStore.getState().playlists[0]!.id;
    render(<AddToPlaylistButton label="Add Al-Fatiha to a playlist" item={item} />);
    await user.click(screen.getByRole("button", { name: /add al-fatiha/i }));
    await user.click(await screen.findByRole("button", { name: /favorites/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    const items = useLibraryStore.getState().playlistItems.filter((entry) => entry.playlist_id === playlistId);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject(item);
  });
});
