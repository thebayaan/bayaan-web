import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePlaylists } from "@/hooks/use-playlists";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

describe("usePlaylists", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("creates a playlist and adds it to the list", async () => {
    const { result } = renderHook(() => usePlaylists());

    await act(async () => {
      const created = await result.current.createPlaylist({ name: "New" });
      expect(created.name).toBe("New");
    });

    expect(result.current.playlists).toHaveLength(1);
    expect(result.current.playlists[0]?.name).toBe("New");
  });

  it("removes a playlist on delete", async () => {
    useLibraryStore.getState().createPlaylist({ name: "Doomed" });
    useLibraryStore.getState().createPlaylist({ name: "Keeper" });
    const doomed = useLibraryStore.getState().playlists.find((p) => p.name === "Doomed");
    const { result } = renderHook(() => usePlaylists());
    expect(result.current.playlists).toHaveLength(2);

    await act(async () => {
      await result.current.deletePlaylist(doomed!.id);
    });

    expect(result.current.playlists.map((p) => p.name)).toEqual(["Keeper"]);
  });
});
