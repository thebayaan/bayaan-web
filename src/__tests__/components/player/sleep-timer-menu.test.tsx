import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SleepTimerMenu } from "@/components/player/sleep-timer-menu";
import { usePlayerStore } from "@/stores/player-store";

describe("SleepTimerMenu", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      settings: {
        repeatMode: "none",
        shuffle: false,
        rate: 1,
        sleepTimerMinutes: null,
        sleepTimerEndsAt: null,
      },
    });
  });

  it("renders the trigger with 'Set sleep timer' label when no timer is active", () => {
    render(<SleepTimerMenu remainingMs={null} />);
    expect(screen.getByRole("button", { name: /set sleep timer/i })).toBeInTheDocument();
  });

  it("clicking the trigger opens the menu with Off + presets", async () => {
    const user = userEvent.setup();
    render(<SleepTimerMenu remainingMs={null} />);
    await user.click(screen.getByRole("button", { name: /set sleep timer/i }));
    expect(screen.getByRole("menu", { name: /sleep timer/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /^off/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /15 minutes/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /30 minutes/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /45 minutes/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /60 minutes/i })).toBeInTheDocument();
  });

  it("picking a preset writes minutes + endsAt to the player store", async () => {
    const user = userEvent.setup();
    render(<SleepTimerMenu remainingMs={null} />);
    await user.click(screen.getByRole("button", { name: /set sleep timer/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /30 minutes/i }));
    expect(usePlayerStore.getState().settings.sleepTimerMinutes).toBe(30);
    expect(usePlayerStore.getState().settings.sleepTimerEndsAt).not.toBeNull();
  });

  it("Off clears an active timer", async () => {
    usePlayerStore.getState().setSleepTimer(15);
    expect(usePlayerStore.getState().settings.sleepTimerMinutes).toBe(15);

    const user = userEvent.setup();
    render(<SleepTimerMenu remainingMs={15 * 60_000} />);
    await user.click(screen.getByRole("button", { name: /sleep timer \(15:00 remaining\)/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /^off/i }));
    expect(usePlayerStore.getState().settings.sleepTimerMinutes).toBeNull();
    expect(usePlayerStore.getState().settings.sleepTimerEndsAt).toBeNull();
  });

  it("shows the remaining countdown label on the trigger when active", () => {
    usePlayerStore.getState().setSleepTimer(10);
    render(<SleepTimerMenu remainingMs={9 * 60_000 + 5_000} />);
    expect(screen.getByText("9:05")).toBeInTheDocument();
  });
});
