import { describe, it, expect } from "vitest";
import {
  ADHKAR_CATEGORIES,
  SAMPLE_DHIKR,
  getCategoryById,
  getDhikrByCategory,
} from "@/data/adhkar-data";

describe("adhkar-data", () => {
  it("exports 6 categories", () => {
    expect(ADHKAR_CATEGORIES).toHaveLength(6);
  });

  it("each category has required fields", () => {
    for (const cat of ADHKAR_CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.name_arabic).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(typeof cat.count).toBe("number");
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("getCategoryById returns the correct category", () => {
    const cat = getCategoryById("morning");
    expect(cat).toBeDefined();
    expect(cat?.name).toBe("Morning Adhkar");
  });

  it("getCategoryById returns undefined for unknown id", () => {
    expect(getCategoryById("nonexistent")).toBeUndefined();
  });

  it("getDhikrByCategory returns dhikr for morning", () => {
    const list = getDhikrByCategory("morning");
    expect(list.length).toBeGreaterThan(0);
    for (const d of list) {
      expect(d.category_id).toBe("morning");
    }
  });

  it("getDhikrByCategory returns empty array for unknown category", () => {
    expect(getDhikrByCategory("nonexistent")).toHaveLength(0);
  });

  it("each dhikr has required fields", () => {
    for (const d of SAMPLE_DHIKR) {
      expect(d.id).toBeTruthy();
      expect(d.category_id).toBeTruthy();
      expect(d.text_arabic).toBeTruthy();
      expect(d.translation).toBeTruthy();
      expect(typeof d.repetitions).toBe("number");
      expect(d.repetitions).toBeGreaterThan(0);
      expect(d.reference).toBeTruthy();
    }
  });
});
