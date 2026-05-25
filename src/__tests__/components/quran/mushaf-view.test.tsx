import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MushafView } from "@/components/quran/mushaf-view";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import type { QcfVerse } from "@/types/quran-api";

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

// `vi.mock` is hoisted to the top of the file, so the factory it
// receives runs *before* any top-level `const versesByPageMock = …`
// would be initialized. Wrap the mock in `vi.hoisted` so it's
// available at hoist time and tests can still call
// `.mockImplementation` per case.
const { versesByPageMock } = vi.hoisted(() => ({
  versesByPageMock: vi.fn((_pageNumber: number) => ({
    verses: [] as QcfVerse[],
    isLoading: false,
    error: undefined,
  })),
}));

vi.mock("@/hooks/use-verses-by-page", () => ({
  useVersesByPage: (pageNumber: number) => versesByPageMock(pageNumber),
}));

vi.mock("@/hooks/use-qcf-font", () => ({
  useQcfFont: () => ({
    isPageFontLoaded: () => true,
    getFontFamily: () => "code_v2",
  }),
}));

describe("MushafView", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState({
      mushafPage: 1,
      lastReadSurahId: null,
      lastReadSurahAt: null,
    });
    versesByPageMock.mockImplementation(() => ({
      verses: [],
      isLoading: false,
      error: undefined,
    }));
  });

  it("renders a continuous scroll layout with an initial page stack", () => {
    render(<MushafView />);
    expect(screen.getByLabelText("Mushaf page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /previous page/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next page/i })).not.toBeInTheDocument();
  });

  it("shows the current page indicator", () => {
    render(<MushafView />);
    expect(screen.getByText("Page 1 / 604")).toBeInTheDocument();
  });

  it("jumps to the surah's first mushaf page when given a surahId outside the stored page", () => {
    // Store thinks we're on page 1, but the user navigated to /quran/3
    // (Al-Imran, pages 50-76). We should open at page 50, not page 1 —
    // otherwise switching surahs in mushaf mode silently does nothing,
    // which is exactly the reported bug.
    render(<MushafView surahId={3} />);
    expect(screen.getByLabelText("Mushaf page 50")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 51")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mushaf page 1")).not.toBeInTheDocument();
  });

  it("resumes inside the surah when the stored page is already in range", () => {
    // User was last on global page 17 (which is inside Al-Baqarah, pages
    // 2-49). Opening /quran/2 should keep them there rather than yanking
    // them back to page 2.
    useReadingSettingsStore.setState({ mushafPage: 17 });
    render(<MushafView surahId={2} />);
    expect(screen.getByLabelText("Mushaf page 17")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 16")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 18")).toBeInTheDocument();
  });

  it("marks the surah as last-read when opened with a surahId", () => {
    render(<MushafView surahId={2} />);
    expect(useReadingSettingsStore.getState().lastReadSurahId).toBe(2);
  });

  it("ignores surahId when none is provided (legacy /mushaf/{page} flow)", () => {
    useReadingSettingsStore.setState({ mushafPage: 42 });
    render(<MushafView entryPage={42} />);
    expect(screen.getByLabelText("Mushaf page 42")).toBeInTheDocument();
    expect(useReadingSettingsStore.getState().lastReadSurahId).toBeNull();
  });

  it("opens on entryPage even when the persisted store still says page 1", () => {
    useReadingSettingsStore.setState({ mushafPage: 1 });
    render(<MushafView entryPage={22} />);
    expect(screen.getByLabelText("Mushaf page 22")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mushaf page 1")).not.toBeInTheDocument();
  });

  it("jumps within the current surah when mushafPage changes in scoped mode", () => {
    useReadingSettingsStore.setState({ mushafPage: 30, mushafJumpSeq: 0 });
    const { rerender } = render(<MushafView surahId={2} />);
    expect(screen.getByLabelText("Mushaf page 30")).toBeInTheDocument();

    useReadingSettingsStore.getState().jumpToMushafPage(35);
    rerender(<MushafView key="jump-35" surahId={2} />);
    expect(screen.getByLabelText("Mushaf page 35")).toBeInTheDocument();
  });

  it("does not preload pages past the surah's last page when scoped", () => {
    // Al-Baqarah is pages 2..49. Resuming at page 49 (its last page) the
    // ±1 window must NOT include page 50 (which is Al-Imran's first
    // page) — that's the "infinite cross-surah scroll" the user
    // explicitly asked us to stop doing. Page 48 (still inside the
    // surah) is fine.
    useReadingSettingsStore.setState({ mushafPage: 49 });
    render(<MushafView surahId={2} />);
    expect(screen.getByLabelText("Mushaf page 49")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 48")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mushaf page 50")).not.toBeInTheDocument();
  });

  it("does not preload pages before the surah's first page when scoped", () => {
    useReadingSettingsStore.setState({ mushafPage: 50 });
    render(<MushafView surahId={3} />);
    expect(screen.getByLabelText("Mushaf page 50")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 51")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mushaf page 49")).not.toBeInTheDocument();
  });

  it("allows cross-surah neighbors in legacy unscoped mushaf mode", () => {
    useReadingSettingsStore.setState({ mushafPage: 49 });
    render(<MushafView />);
    expect(screen.getByLabelText("Mushaf page 49")).toBeInTheDocument();
    expect(screen.getByLabelText("Mushaf page 50")).toBeInTheDocument();
  });

  it("scrolls to the surah's basmallah anchor when opening on a shared page", async () => {
    // An-Nahl (surah 16) starts mid-page on page 267, sharing it with
    // the tail of Al-Hijr. Without anchor-scroll, the user lands on
    // Al-Hijr's last verses. Seed page 267 with An-Nahl verse-1 so
    // MushafPage emits the inline surah header, then assert we scroll
    // that anchor — not the page wrapper — into view.
    const anNahlVerse: QcfVerse = {
      id: 1902,
      verse_number: 1,
      verse_key: "16:1",
      hizb_number: 27,
      rub_el_hizb_number: 105,
      ruku_number: 1,
      manzil_number: 4,
      sajdah_number: null,
      page_number: 267,
      juz_number: 14,
      chapter_id: 16,
      text_uthmani: "x",
      words: [
        {
          id: 1,
          position: 1,
          audio_url: null,
          char_type_name: "word",
          code_v2: "\uFC01",
          page_number: 267,
          line_number: 8,
          text_uthmani: "x",
          text_imlaei_simple: "x",
          qpc_uthmani_hafs: "x",
          verse_key: "16:1",
          verse_id: 1902,
          location: "16:1:1",
        },
      ],
    };
    // Keep the verses array reference stable — returning a fresh `[]`
    // or `[verse]` on every hook call makes MushafPageSection's
    // `useEffect(..., [verses])` fire every render → infinite loop.
    const emptyResult = { verses: [] as QcfVerse[], isLoading: false, error: undefined };
    const page267Result = {
      verses: [anNahlVerse],
      isLoading: false,
      error: undefined,
    };
    versesByPageMock.mockImplementation((pageNumber: number) =>
      pageNumber === 267 ? page267Result : emptyResult,
    );

    const scrollSpy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: scrollSpy,
    });

    render(<MushafView surahId={16} />);

    await waitFor(() => {
      const anchor = document.getElementById("mushaf-surah-16-anchor");
      expect(anchor).not.toBeNull();
      const calledOnAnchor = scrollSpy.mock.instances.some((inst) => inst === anchor);
      expect(calledOnAnchor).toBe(true);
    });
  });
});
