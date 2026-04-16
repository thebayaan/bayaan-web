import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/player/progress-bar";

describe("ProgressBar", () => {
  it("displays formatted time values", () => {
    render(<ProgressBar positionMs={90000} durationMs={300000} onSeek={vi.fn()} />);
    expect(screen.getByText("1:30")).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });

  it("displays 0:00 when no duration", () => {
    render(<ProgressBar positionMs={0} durationMs={0} onSeek={vi.fn()} />);
    const zeros = screen.getAllByText("0:00");
    expect(zeros).toHaveLength(2);
  });
});
