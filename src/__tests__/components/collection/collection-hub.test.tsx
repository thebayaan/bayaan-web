import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CollectionHub } from "@/components/collection/collection-hub";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("CollectionHub", () => {
  it("renders all 4 collection sections", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Playlists")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
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

  it("renders section descriptions", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Your custom playlists")).toBeInTheDocument();
    expect(screen.getByText("Favorited tracks")).toBeInTheDocument();
    expect(screen.getByText("Saved verses")).toBeInTheDocument();
    expect(screen.getByText("Verse annotations")).toBeInTheDocument();
  });
});
