import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TajweedSegments } from "@/components/quran/tajweed-segments";
import { tajweedColors } from "@/constants/tajweed-colors";

describe("TajweedSegments", () => {
  const segments = [
    { text: "بِ", rule: "ham_wasl" as const },
    { text: "سْ", rule: "ghunnah" as const },
    { text: "مِ", rule: null },
  ];

  it("applies tajweed colors when showTajweed is enabled", () => {
    render(<TajweedSegments segments={segments} showTajweed />);
    const spans = screen.getByText("بِ").parentElement?.querySelectorAll("span") ?? [];
    expect(spans[0]).toHaveStyle({ color: tajweedColors.ham_wasl });
    expect(spans[1]).toHaveStyle({ color: tajweedColors.ghunnah });
    expect(spans[2]).not.toHaveAttribute("style");
  });

  it("uses defaultColor when tajweed is disabled", () => {
    render(<TajweedSegments segments={segments} showTajweed={false} defaultColor="#111111" />);
    const spans = screen.getByText("بِ").parentElement?.querySelectorAll("span") ?? [];
    spans.forEach((span) => {
      expect(span).toHaveStyle({ color: "#111111" });
    });
  });

  it("falls back to defaultColor for unknown rules", () => {
    render(
      <TajweedSegments
        segments={[{ text: "x", rule: "unknown-rule" }]}
        showTajweed
        defaultColor="#222222"
      />,
    );
    expect(screen.getByText("x")).toHaveStyle({ color: "#222222" });
  });
});
