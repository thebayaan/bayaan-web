import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SidebarNavItem", () => {
  const MockIcon = ({ size, filled }: { size?: number; filled?: boolean }) => (
    <svg data-testid="icon" data-filled={filled} width={size} height={size} />
  );

  it("renders label and icon", () => {
    render(<SidebarNavItem href="/" icon={MockIcon} label="Home" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("marks active route with filled icon", () => {
    render(<SidebarNavItem href="/" icon={MockIcon} label="Home" />);
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveAttribute("data-filled", "true");
  });

  it("renders inactive for non-matching route", () => {
    render(<SidebarNavItem href="/search" icon={MockIcon} label="Search" />);
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveAttribute("data-filled", "false");
  });
});
