import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { CollectionHub } from "@/components/collection/collection-hub";
import { server } from "@/__tests__/mocks/server";

const API = "http://localhost:3000/api";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("CollectionHub", () => {
  it("renders all 5 collection sections", () => {
    render(<CollectionHub />, { wrapper });
    expect(screen.getByText("Playlists")).toBeInTheDocument();
    expect(screen.getByText("Reciters")).toBeInTheDocument();
    expect(screen.getByText("Loved")).toBeInTheDocument();
    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("links to correct paths", () => {
    render(<CollectionHub />, { wrapper });
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
    render(<CollectionHub />, { wrapper });
    expect(screen.getByText("Your Collection")).toBeInTheDocument();
  });

  it("shows empty text when counts are zero", () => {
    render(<CollectionHub />, { wrapper });
    expect(screen.getByText("Create your first playlist")).toBeInTheDocument();
    expect(screen.getByText("No loved surahs yet")).toBeInTheDocument();
    expect(screen.getByText("No bookmarks yet")).toBeInTheDocument();
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
  });

  it("Loved row reflects the count of useFavorites, not a hardcoded zero", async () => {
    server.use(
      http.get(`${API}/bayaan/user/favorites`, () =>
        HttpResponse.json({
          data: [
            {
              id: "f1",
              reciter_id: "r1",
              rewayat_id: "rw1",
              surah_id: 1,
              created_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "f2",
              reciter_id: "r1",
              rewayat_id: "rw1",
              surah_id: 36,
              created_at: "2025-01-02T00:00:00Z",
            },
            {
              id: "f3",
              reciter_id: "r2",
              rewayat_id: "rw1",
              surah_id: 67,
              created_at: "2025-01-03T00:00:00Z",
            },
          ],
        }),
      ),
    );
    render(<CollectionHub />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("3 items")).toBeInTheDocument();
    });
    expect(screen.queryByText("No loved surahs yet")).not.toBeInTheDocument();
  });
});
