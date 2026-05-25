import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TafsirSheet } from "@/components/quran/tafsir-sheet";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

const useTafsirMock = vi.fn();
vi.mock("@/hooks/use-tafsir", () => ({
  useTafsir: (...args: unknown[]) => useTafsirMock(...args),
}));

describe("TafsirSheet", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState({ tafsirId: "169" });
    useTafsirMock.mockReturnValue({
      text: "<p>Mock tafsir commentary</p>",
      isLoading: false,
    });
  });

  it("renders tafsir text for the selected verse", () => {
    render(<TafsirSheet verseKey="2:255" open onOpenChange={vi.fn()} />);
    expect(screen.getByText(/Tafsir · 2:255/)).toBeInTheDocument();
    expect(screen.getByText("Mock tafsir commentary")).toBeInTheDocument();
    expect(useTafsirMock).toHaveBeenCalledWith("2:255", "169");
  });

  it("does not fetch tafsir when the sheet is closed", () => {
    render(<TafsirSheet verseKey="2:255" open={false} onOpenChange={vi.fn()} />);
    expect(useTafsirMock).toHaveBeenCalledWith(null, "169");
  });

  it("shows loading placeholder when tafsir is loading", () => {
    useTafsirMock.mockReturnValue({ text: null, isLoading: true });
    render(<TafsirSheet verseKey="2:255" open onOpenChange={vi.fn()} />);
    expect(screen.getByText("Loading tafsir…")).toBeInTheDocument();
  });

  it("shows empty state when no tafsir is available", () => {
    useTafsirMock.mockReturnValue({ text: null, isLoading: false });
    render(<TafsirSheet verseKey="2:255" open onOpenChange={vi.fn()} />);
    expect(screen.getByText("No tafsir available for this verse.")).toBeInTheDocument();
  });

  it("updates the selected edition in reading settings", async () => {
    const user = userEvent.setup();
    render(<TafsirSheet verseKey="2:255" open onOpenChange={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText("Tafsir edition"), "817");
    expect(useReadingSettingsStore.getState().tafsirId).toBe("817");
  });
});
