import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  HomeIcon,
  SearchIcon,
  PlayIcon,
  PauseIcon,
  LogoIcon,
  HeartIcon,
} from "@/components/icons";

describe("icons", () => {
  it("renders HomeIcon with default size", () => {
    const { container } = render(<HomeIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("renders HomeIcon with custom size", () => {
    const { container } = render(<HomeIcon size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
  });

  it("renders HomeIcon outline by default", () => {
    const { container } = render(<HomeIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(1);
  });

  it("renders HomeIcon filled variant", () => {
    const { container } = render(<HomeIcon filled />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill");
  });

  it("renders SearchIcon", () => {
    const { container } = render(<SearchIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders PlayIcon", () => {
    const { container } = render(<PlayIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders PauseIcon", () => {
    const { container } = render(<PauseIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2);
  });

  it("renders HeartIcon outline and filled", () => {
    const { container: outline } = render(<HeartIcon />);
    const { container: filled } = render(<HeartIcon filled />);
    const outlinePath = outline.querySelector("path");
    const filledPath = filled.querySelector("path");
    expect(outlinePath).toHaveAttribute("fill", "none");
    expect(filledPath).not.toHaveAttribute("fill", "none");
  });

  it("renders LogoIcon with dark mode colors", () => {
    const { container } = render(<LogoIcon isDarkMode />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill", "#FFFFFF");
  });

  it("renders LogoIcon with light mode colors", () => {
    const { container } = render(<LogoIcon isDarkMode={false} />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill", "#101820");
  });
});
