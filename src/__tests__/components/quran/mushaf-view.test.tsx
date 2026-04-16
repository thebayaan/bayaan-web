import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MushafView } from "@/components/quran/mushaf-view";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

vi.mock("@/hooks/use-verses-by-page", () => ({
  useVersesByPage: () => ({ verses: [], isLoading: false, error: undefined }),
}));

vi.mock("@/hooks/use-qcf-font", () => ({
  useQcfFont: () => ({
    isPageFontLoaded: () => true,
    getFontFamily: () => "code_v2",
  }),
}));

vi.mock("./mushaf-page", () => ({
  MushafPage: () => null,
}));

describe("MushafView nav buttons", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState({ mushafPage: 42 });
  });

  it("Previous button decrements the page", async () => {
    const user = userEvent.setup();
    render(<MushafView />);
    await user.click(screen.getByRole("button", { name: /previous page/i }));
    expect(useReadingSettingsStore.getState().mushafPage).toBe(41);
  });

  it("Next button increments the page", async () => {
    const user = userEvent.setup();
    render(<MushafView />);
    await user.click(screen.getByRole("button", { name: /next page/i }));
    expect(useReadingSettingsStore.getState().mushafPage).toBe(43);
  });

  it("Previous is disabled on page 1", () => {
    useReadingSettingsStore.setState({ mushafPage: 1 });
    render(<MushafView />);
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();
  });

  it("Next is disabled on the last page", () => {
    useReadingSettingsStore.setState({ mushafPage: 604 });
    render(<MushafView />);
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
  });
});
