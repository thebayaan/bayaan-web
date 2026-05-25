import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { VerseTransliteration } from "@/components/quran/verse-transliteration";

vi.mock("@/lib/transliteration", () => ({
  getVerseTransliteration: vi.fn(),
}));

import { getVerseTransliteration } from "@/lib/transliteration";

describe("VerseTransliteration", () => {
  beforeEach(() => {
    vi.mocked(getVerseTransliteration).mockReset();
  });

  it("renders nothing until transliteration loads", () => {
    vi.mocked(getVerseTransliteration).mockReturnValue(new Promise(() => {}));
    const { container } = render(<VerseTransliteration verseKey="1:1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders transliteration text when available", async () => {
    vi.mocked(getVerseTransliteration).mockResolvedValue("Bismillaahir Rahmaanir Raheem");
    render(<VerseTransliteration verseKey="1:1" />);
    await waitFor(() => {
      expect(screen.getByText("Bismillaahir Rahmaanir Raheem")).toBeInTheDocument();
    });
  });

  it("renders nothing when transliteration is missing", async () => {
    vi.mocked(getVerseTransliteration).mockResolvedValue(null);
    const { container } = render(<VerseTransliteration verseKey="999:1" />);
    await waitFor(() => {
      expect(getVerseTransliteration).toHaveBeenCalledWith("999:1");
    });
    expect(container).toBeEmptyDOMElement();
  });
});
