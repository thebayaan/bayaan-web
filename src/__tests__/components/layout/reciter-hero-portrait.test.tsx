import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReciterHeroPortrait } from "@/components/layout/reciter-hero-portrait";

describe("ReciterHeroPortrait", () => {
  it("renders the first letter of the reciter's name when no image", () => {
    render(<ReciterHeroPortrait name="Mishary Alafasy" />);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders an image when imageUrl is provided", () => {
    render(
      <ReciterHeroPortrait name="Abdul Basit" imageUrl="https://example.com/abdul-basit.jpg" />,
    );
    const img = screen.getByRole("img", { name: /abdul basit/i });
    expect(img).toHaveAttribute("src", expect.stringContaining("abdul-basit.jpg"));
  });

  it("uses uppercase for the monogram", () => {
    render(<ReciterHeroPortrait name="mishary" />);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("handles empty name gracefully with a question mark fallback", () => {
    render(<ReciterHeroPortrait name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
