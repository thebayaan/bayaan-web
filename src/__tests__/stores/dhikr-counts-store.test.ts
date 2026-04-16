import { describe, it, expect, beforeEach } from "vitest";
import { useDhikrCountsStore } from "@/stores/dhikr-counts-store";

describe("dhikr counts store", () => {
  beforeEach(() => {
    useDhikrCountsStore.setState({ counts: {} });
  });

  it("starts at zero for any id", () => {
    expect(useDhikrCountsStore.getState().counts["any"]).toBeUndefined();
  });

  it("increments for the correct id without touching others", () => {
    const { increment } = useDhikrCountsStore.getState();
    increment("a");
    increment("a");
    increment("b");
    const { counts } = useDhikrCountsStore.getState();
    expect(counts["a"]).toBe(2);
    expect(counts["b"]).toBe(1);
  });

  it("reset clears a single id", () => {
    const { increment, reset } = useDhikrCountsStore.getState();
    increment("a");
    increment("b");
    reset("a");
    const { counts } = useDhikrCountsStore.getState();
    expect(counts["a"]).toBeUndefined();
    expect(counts["b"]).toBe(1);
  });

  it("resetAll clears every count", () => {
    const { increment, resetAll } = useDhikrCountsStore.getState();
    increment("a");
    increment("b");
    resetAll();
    expect(useDhikrCountsStore.getState().counts).toEqual({});
  });
});
