import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MushafFramedPage } from "@/components/quran/mushaf-framed-page";

describe("MushafFramedPage", () => {
  it("renders the surah banner for page 1", () => {
    render(
      <MushafFramedPage pageNumber={1} surahNumber={1}>
        <p>lines</p>
      </MushafFramedPage>,
    );
    expect(screen.getByLabelText("Surah 1")).toBeInTheDocument();
    expect(screen.getByText("lines")).toBeInTheDocument();
  });

  it("renders bismillah on page 2", () => {
    render(
      <MushafFramedPage pageNumber={2} surahNumber={2}>
        <p>lines</p>
      </MushafFramedPage>,
    );
    expect(screen.getByLabelText("Surah 2")).toBeInTheDocument();
    expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument();
  });
});
