import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { TajweedPreloader } from "@/components/layout/tajweed-preloader";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useTajweedStore } from "@/stores/tajweed-store";

describe("TajweedPreloader", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState({ showTajweed: false });
    useTajweedStore.setState({
      indexedTajweedData: null,
      byLocation: null,
      isLoading: false,
      error: null,
    });
  });

  it("loads tajweed data when coloring is enabled", () => {
    const ensureLoaded = vi.fn().mockResolvedValue(undefined);
    useTajweedStore.setState({ ensureLoaded });
    useReadingSettingsStore.setState({ showTajweed: true });

    render(<TajweedPreloader />);
    expect(ensureLoaded).toHaveBeenCalledTimes(1);
  });

  it("does not preload when tajweed coloring is disabled", () => {
    const ensureLoaded = vi.fn().mockResolvedValue(undefined);
    useTajweedStore.setState({ ensureLoaded });

    render(<TajweedPreloader />);
    expect(ensureLoaded).not.toHaveBeenCalled();
  });
});
