"use client";
import { useState, useCallback, useEffect } from "react";
import { useVersesByPage } from "@/hooks/use-verses-by-page";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { MushafPage } from "./mushaf-page";
import { MushafActionBar } from "./mushaf-action-bar";

const TOTAL_PAGES = 604;

export function MushafView() {
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);
  const setMushafPage = useReadingSettingsStore((s) => s.setMushafPage);
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const [currentPage, setCurrentPage] = useState(mushafPage);

  const pagesToLoad = [currentPage - 1, currentPage, currentPage + 1].filter(
    (p) => p >= 1 && p <= TOTAL_PAGES,
  );
  const { verses, isLoading } = useVersesByPage(currentPage);
  const { isPageFontLoaded, getFontFamily } = useQcfFont(pagesToLoad);

  const clearSelection = useVerseSelectionStore((s) => s.clear);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(TOTAL_PAGES, page));
      setCurrentPage(clamped);
      setMushafPage(clamped);
      clearSelection();
    },
    [setMushafPage, clearSelection],
  );

  useEffect(() => {
    // Clear the selected verse whenever this view unmounts so a stale
    // selection from one page doesn't linger into the reading view.
    return () => clearSelection();
  }, [clearSelection]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex items-center justify-between border-b px-4 py-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)] disabled:opacity-30"
        >
          &#8594; Previous
        </button>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Page</span>
          <input
            type="number"
            min={1}
            max={TOTAL_PAGES}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
            className="w-16 rounded border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] px-2 py-1 text-center text-sm"
          />
          <span className="text-muted-foreground text-sm">/ {TOTAL_PAGES}</span>
        </div>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= TOTAL_PAGES}
          aria-label="Next page"
          className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)] disabled:opacity-30"
        >
          Next &#8592;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex min-h-[600px] items-center justify-center">
            <div className="w-full max-w-[640px] animate-pulse space-y-4 px-8">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 rounded bg-[var(--text-alpha-06)]"
                  style={{ width: `${70 + ((i * 7) % 30)}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <MushafPage
            verses={verses}
            pageNumber={currentPage}
            isFontLoaded={isPageFontLoaded(currentPage)}
            fontFamily={getFontFamily(currentPage)}
            fontSize={`${fontSize}rem`}
          />
        )}
      </div>
      <MushafActionBar verses={verses} />
    </div>
  );
}
