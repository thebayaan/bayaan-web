import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MushafPageScaler } from "@/components/quran/mushaf-page-scaler";
import { MUSHAF_PAGE_WIDTH_PX } from "@/components/quran/mushaf-layout";

describe("MushafPageScaler", () => {
  it("passes children through unchanged at unit scale", () => {
    const { container } = render(
      <MushafPageScaler scale={1}>
        <p>page</p>
      </MushafPageScaler>,
    );
    expect(container.textContent).toBe("page");
    expect(container.querySelector("[style*='transform']")).toBeNull();
  });

  it("wraps content in a scaled container for glyph mushaf zoom", () => {
    const { container } = render(
      <MushafPageScaler scale={1.5}>
        <p>page</p>
      </MushafPageScaler>,
    );
    const outer = container.firstElementChild as HTMLElement;
    const inner = outer.firstElementChild as HTMLElement;
    expect(outer.style.width).toBe(`${MUSHAF_PAGE_WIDTH_PX * 1.5}px`);
    expect(inner.style.transform).toBe("scale(1.5)");
    expect(inner.style.width).toBe(`${MUSHAF_PAGE_WIDTH_PX}px`);
  });
});
