import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

describe("theme-store", () => {
  beforeEach(() => {
    useThemeStore.setState({ themeMode: "dark" });
  });

  it("defaults to dark mode", () => {
    expect(useThemeStore.getState().themeMode).toBe("dark");
  });

  it("switches to light mode", () => {
    useThemeStore.getState().setThemeMode("light");
    expect(useThemeStore.getState().themeMode).toBe("light");
  });

  it("switches to system mode", () => {
    useThemeStore.getState().setThemeMode("system");
    expect(useThemeStore.getState().themeMode).toBe("system");
  });

  it("accepts sepia as a theme mode", () => {
    useThemeStore.getState().setThemeMode("sepia");
    expect(useThemeStore.getState().themeMode).toBe("sepia");
  });
});

describe("getResolvedTheme", () => {
  it("resolves light mode", () => {
    expect(getResolvedTheme("light")).toBe("light");
  });

  it("resolves dark mode", () => {
    expect(getResolvedTheme("dark")).toBe("dark");
  });

  it("resolves sepia mode", () => {
    expect(getResolvedTheme("sepia")).toBe("sepia");
  });

  it("resolves system mode to dark or light", () => {
    const result = getResolvedTheme("system");
    expect(["light", "dark"]).toContain(result);
  });
});
