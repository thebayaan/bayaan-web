import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SurahPicker } from "@/components/quran/surah-picker";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import type { Surah } from "@/types/quran";

const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy }),
}));

const FATIHAH: Surah = {
  id: 1,
  name: "Al-Fatihah",
  revelation_place: "Makkah",
  revelation_order: 5,
  bismillah_pre: false,
  name_arabic: "الفاتحة",
  verses_count: 7,
  pages: "1-1",
  translated_name_english: "The Opener",
};

function openPicker(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole("button", { name: /change surah/i }));
}

describe("SurahPicker", () => {
  beforeEach(() => {
    pushSpy.mockReset();
    useReadingSettingsStore.setState({
      mushafPage: 1,
      viewMode: "reading",
    });
  });

  it("renders the chip with the current surah name", () => {
    render(<SurahPicker surah={FATIHAH} />);
    const trigger = screen.getByRole("button", { name: /change surah \(current: Al-Fatihah\)/i });
    expect(trigger).toBeInTheDocument();
    expect(within(trigger).getByText("Al-Fatihah")).toBeInTheDocument();
  });

  it("opens the picker on chip click and lists all 114 surahs by default", async () => {
    const user = userEvent.setup();
    render(<SurahPicker surah={FATIHAH} />);
    await openPicker(user);
    const list = await screen.findByRole("listbox");
    const options = within(list).getAllByRole("option");
    expect(options).toHaveLength(114);
  });

  it("marks the current surah with aria-current and a 'Current' badge", async () => {
    const user = userEvent.setup();
    render(<SurahPicker surah={FATIHAH} />);
    await openPicker(user);
    const list = await screen.findByRole("listbox");
    const current = within(list).getByText("Current").closest("li");
    expect(current).not.toBeNull();
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveAttribute("data-surah-id", "1");
  });

  it("filters by surah name and navigates on Enter", async () => {
    const user = userEvent.setup();
    render(<SurahPicker surah={FATIHAH} />);
    await openPicker(user);
    const input = await screen.findByRole("combobox");
    await user.type(input, "baqarah");
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/quran/2");
    });
  });

  it("recognises verse references like 2:255", async () => {
    const user = userEvent.setup();
    render(<SurahPicker surah={FATIHAH} />);
    await openPicker(user);
    const input = await screen.findByRole("combobox");
    await user.type(input, "2:255");
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/quran/2/255");
    });
  });

  it("recognises 'page 42' and jumps via the containing surah", async () => {
    const user = userEvent.setup();
    render(<SurahPicker surah={FATIHAH} />);
    await openPicker(user);
    const input = await screen.findByRole("combobox");
    await user.type(input, "page 42");
    await user.keyboard("{Enter}");
    await waitFor(() => {
      // Page 42 lives in Al-Baqarah, so navigation should target that
      // surah with mushaf mode on, not the standalone /mushaf/42 route.
      expect(pushSpy).toHaveBeenCalledWith("/quran/2");
    });
    const { mushafPage, viewMode } = useReadingSettingsStore.getState();
    expect(mushafPage).toBe(42);
    expect(viewMode).toBe("mushaf");
  });

  it("ArrowDown moves the active option to the second result", async () => {
    const user = userEvent.setup();
    render(<SurahPicker surah={FATIHAH} />);
    await openPicker(user);
    const input = await screen.findByRole("combobox");
    // "al-" matches many surahs (Al-Fatihah, Al-Baqarah, ...) so the
    // list has multiple rows to move through.
    await user.type(input, "al-");
    await user.keyboard("{ArrowDown}");
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(1);
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("shows 'No matches' for empty result sets", async () => {
    const user = userEvent.setup();
    render(<SurahPicker surah={FATIHAH} />);
    await openPicker(user);
    const input = await screen.findByRole("combobox");
    await user.type(input, "xyznevermatch");
    await waitFor(() => {
      expect(screen.getByText("No matches")).toBeInTheDocument();
    });
  });
});
