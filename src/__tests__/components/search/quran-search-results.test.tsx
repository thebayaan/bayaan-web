import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuranSearchResults } from "@/components/search/quran-search-results";

vi.mock("@/hooks/use-quran-text-search", () => ({
  useQuranTextSearch: (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3) return { results: [], isLoading: false };
    return {
      isLoading: false,
      results: [
        {
          verse_key: "2:255",
          verse_id: 295,
          text: "Allah",
          highlighted: "Allah",
          translations: [
            {
              text: "Allah — there is no deity except Him",
              resource_id: 131,
              resource_name: "Clear Quran",
            },
          ],
        },
      ],
    };
  },
}));

describe("QuranSearchResults", () => {
  it("returns null for short non-mushaf queries", () => {
    const { container } = render(<QuranSearchResults query="xy" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders mushaf navigation rows for page queries", () => {
    render(<QuranSearchResults query="page 50" />);
    expect(screen.getByText("Mushaf navigation")).toBeInTheDocument();
    expect(screen.getByText("Page 50")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /page 50/i });
    expect(link).toHaveAttribute("href", "/mushaf/50");
  });

  it("renders mushaf navigation rows for verse references", () => {
    render(<QuranSearchResults query="2:255" />);
    expect(screen.getByText("Mushaf navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /2:255/i })).toHaveAttribute("href", "/quran/2/255");
  });

  it("renders text search hits when no mushaf query matches", () => {
    render(<QuranSearchResults query="allah" />);
    expect(screen.getByText("Quran text")).toBeInTheDocument();
    expect(screen.getByText("2:255")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /2:255/i })).toHaveAttribute("href", "/quran/2/255");
  });
});
