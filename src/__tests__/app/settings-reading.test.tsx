import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReadingSettingsPage from "@/app/(app)/settings/reading/page";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

describe("Reading settings", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState({
      fontSize: 1.8,
      showTransliteration: false,
      showWordByWord: false,
      showTajweed: false,
    });
  });

  it("increments and decrements font size within bounds", async () => {
    const user = userEvent.setup();
    render(<ReadingSettingsPage />);

    await user.click(screen.getByRole("button", { name: /increase font size/i }));
    expect(useReadingSettingsStore.getState().fontSize).toBeCloseTo(2.0, 1);

    await user.click(screen.getByRole("button", { name: /decrease font size/i }));
    await user.click(screen.getByRole("button", { name: /decrease font size/i }));
    expect(useReadingSettingsStore.getState().fontSize).toBeCloseTo(1.6, 1);
  });

  it("toggles tajweed", async () => {
    const user = userEvent.setup();
    render(<ReadingSettingsPage />);

    await user.click(screen.getByRole("switch", { name: /tajweed colors/i }));
    expect(useReadingSettingsStore.getState().showTajweed).toBe(true);
  });

  it("hides tajweed toggle when Tajweed Mushaf font is selected", () => {
    useReadingSettingsStore.setState({ quranFontId: "qcf_tajweed_v4" });
    render(<ReadingSettingsPage />);

    expect(screen.queryByRole("switch", { name: /tajweed colors/i })).not.toBeInTheDocument();
  });

  it("changes quran font", async () => {
    const user = userEvent.setup();
    render(<ReadingSettingsPage />);

    await user.selectOptions(screen.getByLabelText(/quran font/i), "indopak");
    expect(useReadingSettingsStore.getState().quranFontId).toBe("indopak");
  });
});
