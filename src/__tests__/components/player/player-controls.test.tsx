import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerControls } from "@/components/player/player-controls";

describe("PlayerControls", () => {
  const defaultProps = {
    isPlaying: false,
    onPlayPause: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    repeatMode: "none" as const,
    onRepeatChange: vi.fn(),
    shuffle: false,
    onShuffleToggle: vi.fn(),
  };

  it("renders play button when paused", () => {
    render(<PlayerControls {...defaultProps} />);
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("renders pause button when playing", () => {
    render(<PlayerControls {...defaultProps} isPlaying />);
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("calls onPlayPause when play button clicked", async () => {
    const user = userEvent.setup();
    const onPlayPause = vi.fn();
    render(<PlayerControls {...defaultProps} onPlayPause={onPlayPause} />);
    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button clicked", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<PlayerControls {...defaultProps} onNext={onNext} />);
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onPrevious when previous button clicked", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    render(<PlayerControls {...defaultProps} onPrevious={onPrevious} />);
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("renders a loading-state play button while isLoading", () => {
    render(<PlayerControls {...defaultProps} isLoading />);
    const btn = screen.getByRole("button", { name: /loading/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("does not fire onPlayPause when the button is in loading state", async () => {
    const user = userEvent.setup();
    const onPlayPause = vi.fn();
    render(<PlayerControls {...defaultProps} isLoading onPlayPause={onPlayPause} />);
    const btn = screen.getByRole("button", { name: /loading/i });
    await user.click(btn);
    expect(onPlayPause).not.toHaveBeenCalled();
  });
});
