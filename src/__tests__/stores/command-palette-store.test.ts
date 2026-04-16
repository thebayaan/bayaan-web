import { describe, it, expect, beforeEach } from "vitest";
import { useCommandPaletteStore } from "@/stores/command-palette-store";

describe("command palette store", () => {
  beforeEach(() => {
    useCommandPaletteStore.setState({ open: false });
  });

  it("toggle flips the open state", () => {
    useCommandPaletteStore.getState().toggle();
    expect(useCommandPaletteStore.getState().open).toBe(true);
    useCommandPaletteStore.getState().toggle();
    expect(useCommandPaletteStore.getState().open).toBe(false);
  });

  it("setOpen drives the flag directly", () => {
    useCommandPaletteStore.getState().setOpen(true);
    expect(useCommandPaletteStore.getState().open).toBe(true);
  });
});
