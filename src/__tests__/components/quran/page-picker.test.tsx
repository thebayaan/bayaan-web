import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PagePicker } from "@/components/quran/page-picker";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/quran/2",
  useSearchParams: () => new URLSearchParams(),
}));

describe("PagePicker", () => {
  beforeEach(() => {
    pushMock.mockClear();
    useReadingSettingsStore.setState({ mushafPage: 1, viewMode: "reading" });
  });

  it("shows validation error for out-of-range pages", () => {
    render(<PagePicker open onOpenChange={vi.fn()} />);
    const input = screen.getByLabelText("Mushaf page number");
    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByText("Enter a page between 1 and 604.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("navigates to the surah reader for the target page and updates settings", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<PagePicker open onOpenChange={onOpenChange} />);

    await user.type(screen.getByLabelText("Mushaf page number"), "42");
    await user.click(screen.getByRole("button", { name: "Go to page" }));

    expect(useReadingSettingsStore.getState().mushafPage).toBe(42);
    expect(useReadingSettingsStore.getState().viewMode).toBe("mushaf");
    expect(pushMock).toHaveBeenCalledWith("/quran/2");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("navigates to the surah reader that contains the target page", async () => {
    const user = userEvent.setup();
    render(<PagePicker open onOpenChange={vi.fn()} />);

    await user.type(screen.getByLabelText("Mushaf page number"), "17");
    await user.click(screen.getByRole("button", { name: "Go to page" }));

    expect(pushMock).toHaveBeenCalledWith("/quran/2");
    expect(pushMock).not.toHaveBeenCalledWith("/mushaf/17");
  });

  it("clears input error when the user edits the field", () => {
    render(<PagePicker open onOpenChange={vi.fn()} />);
    const input = screen.getByLabelText("Mushaf page number");
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText("Enter a page between 1 and 604.")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "5" } });
    expect(screen.queryByText("Enter a page between 1 and 604.")).not.toBeInTheDocument();
  });
});
