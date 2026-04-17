import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders a div with the skeleton-pulse animation class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.className).toContain("animate-skeleton-pulse");
  });

  it("merges a caller-provided className", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-20");
  });

  it("forwards aria-label for accessibility", () => {
    const { container } = render(<Skeleton aria-label="Loading verse" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-label")).toBe("Loading verse");
  });
});
