import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const preloadSpy = vi.fn();
vi.mock("swr", () => ({
  preload: (...args: unknown[]) => preloadSpy(...args),
}));

const fetchBayaanSpy = vi.fn();
vi.mock("@/lib/api", () => ({
  fetchBayaan: (...args: unknown[]) => fetchBayaanSpy(...args),
}));

import { RecitersPreloader } from "@/components/layout/reciters-preloader";

describe("RecitersPreloader", () => {
  beforeEach(() => {
    preloadSpy.mockClear();
  });

  it("calls SWR preload for the reciters list on mount", () => {
    render(<RecitersPreloader />);
    expect(preloadSpy).toHaveBeenCalledTimes(1);
    expect(preloadSpy).toHaveBeenCalledWith("reciters?page=1&limit=200", expect.any(Function));
  });
});
