import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/player/progress-bar";

describe("ProgressBar", () => {
  it("displays m:ss under an hour", () => {
    render(<ProgressBar positionMs={90000} durationMs={300000} onSeek={vi.fn()} />);
    expect(screen.getByText("1:30")).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });

  it("switches to h:mm:ss at and past one hour", () => {
    render(<ProgressBar positionMs={3725000} durationMs={7200000} onSeek={vi.fn()} />);
    expect(screen.getByText("1:02:05")).toBeInTheDocument();
    expect(screen.getByText("2:00:00")).toBeInTheDocument();
  });

  it("displays 0:00 when no duration", () => {
    render(<ProgressBar positionMs={0} durationMs={0} onSeek={vi.fn()} />);
    const zeros = screen.getAllByText("0:00");
    expect(zeros).toHaveLength(2);
  });
});
