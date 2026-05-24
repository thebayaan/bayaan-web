import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeartToggle } from "@/components/player/heart-toggle";
import { resetLibraryStore } from "@/__tests__/helpers/reset-library-store";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

const ref = { reciter_id: "r1", rewayat_id: "rw1", surah_id: 36 };

describe("HeartToggle", () => {
  beforeEach(() => {
    resetLibraryStore();
  });

  it("renders an unpressed heart when the track is not favorited", () => {
    render(<HeartToggle target={ref} trackTitle="Ya-Sin" />);
    const btn = screen.getByRole("button", { name: /save ya-sin to favorites/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("rapid double-click toggles on then off with local storage", async () => {
    const user = userEvent.setup();
    render(<HeartToggle target={ref} trackTitle="Ya-Sin" />);
    const trigger = screen.getByRole("button", { name: /save ya-sin to favorites/i });
    await user.click(trigger);
    await user.click(trigger);

    expect(screen.getByRole("button", { name: /save ya-sin to favorites/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("toggles to pressed after a click and back after a second click", async () => {
    const user = userEvent.setup();
    render(<HeartToggle target={ref} trackTitle="Ya-Sin" />);

    await user.click(screen.getByRole("button", { name: /save ya-sin to favorites/i }));
    expect(screen.getByRole("button", { name: /remove ya-sin from favorites/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /remove ya-sin from favorites/i }));
    expect(screen.getByRole("button", { name: /save ya-sin to favorites/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
