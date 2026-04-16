import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsOverviewPage from "@/app/(app)/settings/page";

describe("Settings overview", () => {
  it("links to each settings subpage", () => {
    render(<SettingsOverviewPage />);
    const nav = screen.getByRole("navigation", { name: /settings sections/i });
    const expectedHrefs = [
      "/settings/appearance",
      "/settings/reading",
      "/settings/reading-themes",
      "/settings/about",
    ];
    const actualHrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(actualHrefs).toEqual(expectedHrefs);
  });
});
