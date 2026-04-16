import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppearanceSettingsPage from "@/app/(app)/settings/appearance/page";
import { useThemeStore } from "@/stores/theme-store";

describe("Appearance settings", () => {
  beforeEach(() => {
    useThemeStore.setState({ themeMode: "system" });
  });

  it("reflects the current theme mode and switches on click", async () => {
    const user = userEvent.setup();
    render(<AppearanceSettingsPage />);

    const systemRadio = screen.getByRole("radio", { name: /system/i });
    expect(systemRadio).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("radio", { name: /dark/i }));
    expect(useThemeStore.getState().themeMode).toBe("dark");
  });
});
