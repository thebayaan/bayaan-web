import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CollectionHub } from "@/components/collection/collection-hub";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("CollectionHub", () => {
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
    expect(screen.getByText("No bookmarks yet")).toBeInTheDocument();
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
  });
});
