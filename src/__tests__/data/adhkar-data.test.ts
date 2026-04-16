import { describe, it, expect } from "vitest";
import {
  getCategories,
  getCategoryById,
  getDhikrByCategory,
  getDhikrById,
  colorForCategory,
} from "@/data/adhkar-data";

describe("adhkar-data adapter", () => {
  it("exposes the full category list from the bundled JSON", () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(100);
    expect(categories[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      dhikrCount: expect.any(Number),
      tags: expect.any(Array),
    });
  });

  it("returns dhikr for a known category, ordered by orderIndex", () => {
    const first = getCategories()[0]!;
    const list = getDhikrByCategory(first.id);
    expect(list.length).toBeGreaterThan(0);
    const indices = list.map((d) => d.orderIndex);
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThanOrEqual(indices[i - 1]!);
    }
  });

  it("returns undefined for unknown lookups", () => {
    expect(getCategoryById("__nope__")).toBeUndefined();
    expect(getDhikrById("__nope__")).toBeUndefined();
    expect(getDhikrByCategory("__nope__")).toEqual([]);
  });

  it("assigns a deterministic hex color for each category", () => {
    for (const cat of getCategories().slice(0, 20)) {
      expect(colorForCategory(cat)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
