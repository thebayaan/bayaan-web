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
      "/settings/translations",
      "/settings/reading-themes",
      "/settings/storage",
      "https://thebayaan.com/support",
      "https://thebayaan.com/support",
      "/settings/whats-new",
      "/settings/about",
      "/settings/credits",
      "https://github.com/thebayaan/bayaan-web",
      "https://thebayaan.com/terms",
      "https://thebayaan.com/privacy",
    ];
    const actualHrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(actualHrefs).toEqual(expectedHrefs);
  });
});
