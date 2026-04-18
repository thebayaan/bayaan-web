import { describe, it, expect, vi } from "vitest";

const notFoundSpy = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
vi.mock("next/navigation", () => ({
  notFound: () => notFoundSpy(),
}));

vi.mock("@/components/quran/reading-view", () => ({
  ReadingView: ({ surahId, targetAyah }: { surahId: number; targetAyah?: number }) => (
    <div data-testid="reading-view" data-surah={surahId} data-ayah={targetAyah ?? ""} />
  ),
}));

import QuranAyahPage, { generateMetadata } from "@/app/(app)/quran/[surah]/[ayah]/page";
import { render, screen } from "@testing-library/react";

describe("/quran/[surah]/[ayah]", () => {
  it("renders ReadingView with target verse for valid input", async () => {
    const page = await QuranAyahPage({
      params: Promise.resolve({ surah: "2", ayah: "255" }),
    });
    render(page);
    const view = screen.getByTestId("reading-view");
    expect(view).toHaveAttribute("data-surah", "2");
    expect(view).toHaveAttribute("data-ayah", "255");
  });

  it("triggers notFound for a surah out of range", async () => {
    await expect(
      QuranAyahPage({ params: Promise.resolve({ surah: "999", ayah: "1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("triggers notFound when ayah exceeds the surah's verses_count", async () => {
    await expect(
      QuranAyahPage({ params: Promise.resolve({ surah: "1", ayah: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("generateMetadata returns a specific title for valid verses", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ surah: "2", ayah: "255" }),
    });
    expect(metadata.title).toContain("2:255");
  });

  it("generateMetadata returns a not-found title for invalid verses", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ surah: "999", ayah: "1" }),
    });
    expect(metadata.title).toBe("Verse not found");
  });
});
