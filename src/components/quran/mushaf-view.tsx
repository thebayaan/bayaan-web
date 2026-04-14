"use client";
import { useState, useCallback } from "react";
import { useVersesByPage } from "@/hooks/use-verses-by-page";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { MushafPage } from "./mushaf-page";

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

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(TOTAL_PAGES, page));
      setCurrentPage(clamped);
      setMushafPage(clamped);
    },
    [setMushafPage],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= TOTAL_PAGES}
          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--text-alpha-06)] disabled:opacity-30 hover:bg-[var(--text-alpha-10)] transition-colors"
        >
          &#8594; Previous
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page</span>
          <input
            type="number"
            min={1}
            max={TOTAL_PAGES}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
            className="w-16 text-center text-sm bg-[var(--text-alpha-04)] border border-[var(--text-alpha-06)] rounded px-2 py-1"
          />
          <span className="text-sm text-muted-foreground">/ {TOTAL_PAGES}</span>
        </div>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--text-alpha-06)] disabled:opacity-30 hover:bg-[var(--text-alpha-10)] transition-colors"
        >
          Next &#8592;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="animate-pulse space-y-4 w-full max-w-[640px] px-8">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-[var(--text-alpha-06)] rounded"
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
    </div>
  );
}
