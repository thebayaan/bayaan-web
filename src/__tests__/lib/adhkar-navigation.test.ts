import { describe, it, expect } from "vitest";
import { getDhikrSections, getDhikrSequence, getDhikrNeighbors } from "@/lib/adhkar-navigation";

describe("adhkar-navigation", () => {
  it("returns grouped sections for multi-category super topics", () => {
    const sections = getDhikrSections("salah");
    expect(sections.length).toBeGreaterThan(1);
    expect(sections[0]).toMatchObject({
      categoryId: expect.any(String),
      title: expect.any(String),
      dhikrList: expect.any(Array),
    });
  });

  it("returns a single section for numeric category routes", () => {
    const sections = getDhikrSections("1");
    expect(sections).toHaveLength(1);
    expect(sections[0]?.categoryId).toBe("1");
  });

  it("orders dhikr for prev/next navigation", () => {
    const list = getDhikrSequence("waking-up");
    expect(list.length).toBeGreaterThan(0);
    const first = list[0]!;
    const neighbors = getDhikrNeighbors("waking-up", first.id);
    expect(neighbors.index).toBe(0);
    expect(neighbors.prev).toBeNull();
    if (list.length > 1) {
      expect(neighbors.next?.id).toBe(list[1]?.id);
    }
  });
});
