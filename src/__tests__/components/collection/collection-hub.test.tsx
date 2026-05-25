import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CollectionHub } from "@/components/collection/collection-hub";
import { useLibraryStore } from "@/stores/library-store";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("CollectionHub", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("renders all 5 collection sections", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Playlists")).toBeInTheDocument();
    expect(screen.getByText("Reciters")).toBeInTheDocument();
    expect(screen.getByText("Loved")).toBeInTheDocument();
    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("links to correct paths", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Playlists").closest("a")).toHaveAttribute(
      "href",
      "/collection/playlists",
    );
    expect(screen.getByText("Reciters").closest("a")).toHaveAttribute(
      "href",
      "/collection/favorite-reciters",
    );
    expect(screen.getByText("Loved").closest("a")).toHaveAttribute("href", "/collection/favorites");
    expect(screen.getByText("Bookmarks").closest("a")).toHaveAttribute(
      "href",
      "/collection/bookmarks",
    );
  });

  it("renders the page heading", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Your Collection")).toBeInTheDocument();
  });

  it("shows empty text when counts are zero", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Create your first playlist")).toBeInTheDocument();
    expect(screen.getByText("No loved surahs yet")).toBeInTheDocument();
    expect(screen.getByText("No bookmarks yet")).toBeInTheDocument();
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
  });

  it("Loved row reflects the count of useFavorites, not a hardcoded zero", async () => {
    useLibraryStore.getState().addFavorite({
      reciter_id: "r1",
      rewayat_id: "rw1",
      surah_id: 1,
    });
    useLibraryStore.getState().addFavorite({
      reciter_id: "r1",
      rewayat_id: "rw1",
      surah_id: 36,
    });
    useLibraryStore.getState().addFavorite({
      reciter_id: "r2",
      rewayat_id: "rw1",
      surah_id: 67,
    });
    render(<CollectionHub />);
    await waitFor(() => {
      expect(screen.getByText("3 items")).toBeInTheDocument();
    });
    expect(screen.queryByText("No loved surahs yet")).not.toBeInTheDocument();
  });
});
