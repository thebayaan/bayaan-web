import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MushafView } from "@/components/quran/mushaf-view";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

vi.mock("@/hooks/use-verses-by-page", () => ({
  useVersesByPage: () => ({ verses: [], isLoading: false, error: undefined }),
}));

vi.mock("@/hooks/use-qcf-font", () => ({
  useQcfFont: () => ({
    isPageFontLoaded: () => true,
    getFontFamily: () => "code_v2",
  }),
}));

describe("MushafView", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState({ mushafPage: 1 });
  });

  it("renders a continuous scroll layout with an initial page stack", () => {
    render(<MushafView />);
    expect(screen.getByLabelText("Mushaf page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /previous page/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next page/i })).not.toBeInTheDocument();
  });

  it("shows the current page indicator", () => {
    render(<MushafView />);
    expect(screen.getByText("Page 1 / 604")).toBeInTheDocument();
  });
});
