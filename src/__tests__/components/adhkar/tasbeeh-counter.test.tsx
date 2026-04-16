import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasbeehCounter } from "@/components/adhkar/tasbeeh-counter";
import { useDhikrCountsStore } from "@/stores/dhikr-counts-store";

describe("TasbeehCounter", () => {
  beforeEach(() => {
    useDhikrCountsStore.setState({ counts: {} });
  });

  it("increments count on click", async () => {
    const user = userEvent.setup();
    render(<TasbeehCounter dhikrId="d1" target={33} />);
    const counter = screen.getByRole("spinbutton", { name: /tasbeeh counter/i });
    await user.click(counter);
    await user.click(counter);
    expect(useDhikrCountsStore.getState().counts["d1"]).toBe(2);
  });

  it("increments count on Space when focused", async () => {
    const user = userEvent.setup();
    render(<TasbeehCounter dhikrId="d2" target={3} />);
    const counter = screen.getByRole("spinbutton", { name: /tasbeeh counter/i });
    counter.focus();
    await user.keyboard(" ");
    expect(useDhikrCountsStore.getState().counts["d2"]).toBe(1);
  });

  it("reset restores zero for that id only", async () => {
    const user = userEvent.setup();
    useDhikrCountsStore.setState({ counts: { d3: 10, d4: 5 } });
    render(<TasbeehCounter dhikrId="d3" target={33} />);
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(useDhikrCountsStore.getState().counts["d3"]).toBeUndefined();
    expect(useDhikrCountsStore.getState().counts["d4"]).toBe(5);
  });

  it("shares aria-valuenow with the count", () => {
    useDhikrCountsStore.setState({ counts: { d5: 7 } });
    render(<TasbeehCounter dhikrId="d5" target={33} />);
    const counter = screen.getByRole("spinbutton", { name: /tasbeeh counter/i });
    expect(counter).toHaveAttribute("aria-valuenow", "7");
    expect(counter).toHaveAttribute("aria-valuemax", "33");
  });
});
