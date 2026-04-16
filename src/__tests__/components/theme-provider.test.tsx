import { describe, expect, it, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import { useThemeStore } from "@/stores/theme-store";

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    useThemeStore.setState({ themeMode: "dark" });
  });

  it("writes data-theme='dark' when theme is dark", () => {
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("writes data-theme='light' when theme is light", () => {
    useThemeStore.setState({ themeMode: "light" });
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("writes data-theme='sepia' when theme is sepia", () => {
    useThemeStore.setState({ themeMode: "sepia" });
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("sepia");
  });

  it("does not leave a .dark class on <html>", () => {
    useThemeStore.setState({ themeMode: "dark" });
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("updates the attribute when themeMode changes", () => {
    const { rerender } = render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    act(() => {
      useThemeStore.setState({ themeMode: "sepia" });
    });
    rerender(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("sepia");
  });
});
