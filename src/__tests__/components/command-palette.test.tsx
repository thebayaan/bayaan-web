import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { useCommandPaletteStore } from "@/stores/command-palette-store";

const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy }),
}));

vi.mock("@/hooks/use-reciters", () => ({
  useReciters: () => ({
    reciters: [
      {
        id: "r-1",
        name: "Mishary Alafasy",
        name_arabic: "مشاري راشد العفاسي",
        slug: "mishary-alafasy",
        is_featured: true,
        rewayat: [],
      },
    ],
    featured: [],
    isLoading: false,
    error: undefined,
  }),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    pushSpy.mockReset();
    useCommandPaletteStore.setState({ open: false });
  });

  it("shows surah + reciter + adhkar results when opened", async () => {
    render(<CommandPalette />);
    useCommandPaletteStore.getState().setOpen(true);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
    const items = screen.getAllByRole("option");
    expect(items.length).toBeGreaterThan(0);
  });

  it("fuzzy-filters and navigates on Enter", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);
    useCommandPaletteStore.getState().setOpen(true);
    const input = await screen.findByRole("combobox");
    await user.type(input, "fatiha");
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/quran/1");
    });
  });

  it("ArrowDown moves the active option", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);
    useCommandPaletteStore.getState().setOpen(true);
    const input = await screen.findByRole("combobox");
    await user.type(input, "surah");
    await user.keyboard("{ArrowDown}");
    const selected = screen.getAllByRole("option").find((el) => el.ariaSelected === "true");
    expect(selected).toBeTruthy();
  });

  it("routes to /quran/<surah>/<ayah> when the query is a verse reference", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);
    useCommandPaletteStore.getState().setOpen(true);
    const input = await screen.findByRole("combobox");
    await user.type(input, "2:255");
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/quran/2/255");
    });
  });

  it("does not inject a verse result for out-of-range references", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);
    useCommandPaletteStore.getState().setOpen(true);
    const input = await screen.findByRole("combobox");
    // Al-Fatihah has 7 verses; 50 is out of range
    await user.type(input, "1:50");
    const items = screen.queryAllByRole("option");
    const verseItems = items.filter((el) => el.textContent?.includes("Verse"));
    expect(verseItems).toHaveLength(0);
  });
});
