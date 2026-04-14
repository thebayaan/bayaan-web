import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("MobileTabBar", () => {
  it("renders all 5 tab items", () => {
    render(<MobileTabBar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Collection")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders tab links with correct hrefs", () => {
    render(<MobileTabBar />);
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
    const searchLink = screen.getByText("Search").closest("a");
    expect(searchLink).toHaveAttribute("href", "/search");
  });
});
