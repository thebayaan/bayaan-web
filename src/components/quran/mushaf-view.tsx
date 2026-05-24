"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { MushafActionBar } from "./mushaf-action-bar";
import { MushafPageSection } from "./mushaf-page-section";
import type { QcfVerse } from "@/types/quran-api";

const TOTAL_PAGES = 604;

function buildInitialPages(startPage: number): number[] {
  const from = Math.max(1, startPage - 1);
  const to = Math.min(TOTAL_PAGES, startPage + 1);
  const pages: number[] = [];
  for (let page = from; page <= to; page += 1) {
    pages.push(page);
  }
  return pages;
}

export function MushafView() {
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);
  const setMushafPage = useReadingSettingsStore((s) => s.setMushafPage);
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const clearSelection = useVerseSelectionStore((s) => s.clear);

  const [loadedPages, setLoadedPages] = useState<number[]>(() => buildInitialPages(mushafPage));
  const [visiblePage, setVisiblePage] = useState(mushafPage);
  const [allVerses, setAllVerses] = useState<QcfVerse[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hasScrolledToInitialPage = useRef(false);
  const versesByPageRef = useRef<Map<number, QcfVerse[]>>(new Map());

  const { isPageFontLoaded, getFontFamily } = useQcfFont(loadedPages);
  const fontResolver = useMemo(
    () => ({ isPageFontLoaded, getFontFamily }),
    [isPageFontLoaded, getFontFamily],
  );

  const registerPageRef = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    if (element) {
      pageRefs.current.set(pageNumber, element);
    } else {
      pageRefs.current.delete(pageNumber);
    }
  }, []);

  const handleVersesLoaded = useCallback((pageNumber: number, verses: QcfVerse[]) => {
    versesByPageRef.current.set(pageNumber, verses);
    setAllVerses(loadedPages.flatMap((page) => versesByPageRef.current.get(page) ?? []));
  }, [loadedPages]);

  useEffect(() => {
    setAllVerses(loadedPages.flatMap((page) => versesByPageRef.current.get(page) ?? []));
  }, [loadedPages]);

  const appendNextPage = useCallback(() => {
    const lastPage = loadedPages[loadedPages.length - 1];
    if (lastPage >= TOTAL_PAGES) return;
    const nextPage = lastPage + 1;
    setLoadedPages((current) => (current.includes(nextPage) ? current : [...current, nextPage]));
  }, [loadedPages]);

  const prependPreviousPage = useCallback(() => {
    const firstPage = loadedPages[0];
    if (firstPage <= 1) return;
    const previousPage = firstPage - 1;
    setLoadedPages((current) =>
      current.includes(previousPage) ? current : [previousPage, ...current],
    );
  }, [loadedPages]);

  useEffect(() => {
    return () => clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    if (hasScrolledToInitialPage.current || mushafPage <= 1) return;
    const target = pageRefs.current.get(mushafPage);
    if (!target) return;
    target.scrollIntoView({ block: "start" });
    hasScrolledToInitialPage.current = true;
  }, [loadedPages, mushafPage]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.page))
          .filter((page) => Number.isFinite(page));

        if (visible.length === 0) return;

        const nextVisiblePage = Math.min(...visible);
        setVisiblePage(nextVisiblePage);
        setMushafPage(nextVisiblePage);
      },
      { root: container, threshold: 0.35 },
    );

    pageRefs.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [loadedPages, setMushafPage]);

  return (
    <div className="relative flex h-full flex-col">
      <div className="border-border sticky top-0 z-10 border-b bg-[var(--background)]/95 px-4 py-2 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[420px] items-center justify-between gap-3">
          <span className="text-muted-foreground text-sm">Mushaf</span>
          <span className="text-sm font-medium tabular-nums">
            Page {visiblePage} / {TOTAL_PAGES}
          </span>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[420px] flex-col px-4 py-6">
          {loadedPages.map((pageNumber, index) => (
            <div key={pageNumber}>
              <MushafPageSection
                pageNumber={pageNumber}
                fontResolver={fontResolver}
                fontSize={`${fontSize}rem`}
                onVersesLoaded={handleVersesLoaded}
                registerPageRef={registerPageRef}
                onReachTop={prependPreviousPage}
                onReachBottom={appendNextPage}
                showTopSentinel={index === 0 && pageNumber > 1}
                showBottomSentinel={index === loadedPages.length - 1 && pageNumber < TOTAL_PAGES}
              />
              {index < loadedPages.length - 1 ? (
                <div
                  className="my-8 border-t border-[var(--text-alpha-10)]"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <MushafActionBar verses={allVerses} />
    </div>
  );
}
