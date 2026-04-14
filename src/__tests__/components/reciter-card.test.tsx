import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReciterCard } from "@/components/reciter-card";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("ReciterCard", () => {
  const mockReciter = {
    id: "r-1",
    name: "Mishary Alafasy",
    slug: "mishary-alafasy",
    image_url: "https://cdn.thebayaan.com/test.jpg",
    is_featured: true,
    rewayat: [
      {
        id: "rw-1",
        reciter_id: "r-1",
        name: "Hafs A'n Assem",
        style: "murattal" as const,
        server: "https://cdn.thebayaan.com/test",
        source_type: "bayaan",
        surah_total: 114,
        surah_list: [],
        mp3quran_read_id: null,
        qdc_reciter_id: null,
      },
    ],
  };

  it("renders reciter name", () => {
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByText("Mishary Alafasy")).toBeInTheDocument();
  });

  it("renders reciter image", () => {
    render(<ReciterCard reciter={mockReciter} />);
    const img = screen.getByAltText("Mishary Alafasy");
    expect(img).toBeInTheDocument();
  });

  it("shows rewayat style badge", () => {
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByText(/murattal/i)).toBeInTheDocument();
  });

  it("links to reciter profile", () => {
    render(<ReciterCard reciter={mockReciter} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/reciter/mishary-alafasy");
  });
});
