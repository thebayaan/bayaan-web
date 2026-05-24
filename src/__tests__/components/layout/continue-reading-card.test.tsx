import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { ContinueReadingCard } from "@/components/layout/continue-reading-card";

describe("ContinueReadingCard (sidebar)", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState({
      mushafPage: 1,
      lastReadSurahId: null,
      lastReadSurahAt: null,
    });
  });

  it("renders nothing when there is no last-read surah", () => {
    const { container } = render(<ContinueReadingCard />);
    expect(container.textContent).toBe("");
  });

  it("shows progress relative to the surah's page range, not /604", async () => {
    // User was last reading Al-Baqarah (pages 2-49) and is on global
    // mushaf page 17. Within Al-Baqarah that's page 16 of 48 = 33%, NOT
    // page 17 of 604 = 3% (which is the bug we're fixing).
    useReadingSettingsStore.setState({
      mushafPage: 17,
      lastReadSurahId: 2,
      lastReadSurahAt: "2026-05-23T00:00:00Z",
    });
    render(<ContinueReadingCard />);
    await waitFor(() => {
      expect(screen.getByText(/33% · page 16 of 48/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/of 604/)).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "33");
  });

  it("deep-links to the surah, not to the global mushaf page", async () => {
    useReadingSettingsStore.setState({
      mushafPage: 100,
      lastReadSurahId: 36, // Ya-Sin
      lastReadSurahAt: "2026-05-23T00:00:00Z",
    });
    render(<ContinueReadingCard />);
    await waitFor(() => {
      expect(screen.getByRole("link")).toHaveAttribute("href", "/quran/36");
    });
  });

  it("clamps to 100% when the user has scrolled past the surah's last page", async () => {
    // mushafPage past Al-Baqarah's end (49). Should show "page 48 of 48 ·
    // 100%", not "page 99 of 48".
    useReadingSettingsStore.setState({
      mushafPage: 99,
      lastReadSurahId: 2,
      lastReadSurahAt: "2026-05-23T00:00:00Z",
    });
    render(<ContinueReadingCard />);
    await waitFor(() => {
      expect(screen.getByText(/100% · page 48 of 48/i)).toBeInTheDocument();
    });
  });
});
