"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMushafFontResolver } from "@/hooks/use-mushaf-font-resolver";
import {
  useReadingSettingsStore,
  type ReadingSettingsState,
} from "@/stores/reading-settings-store";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { useAyahTrackerStore } from "@/stores/ayah-tracker-store";
import { usePlayerStore } from "@/stores/player-store";
import { MushafActionBar } from "./mushaf-action-bar";
import { MushafPageSection } from "./mushaf-page-section";
import { ReaderPlaybackSync } from "./reader-playback-sync";
import { MUSHAF_PAGE_CLASS } from "./mushaf-layout";
import { mushafSurahAnchorId } from "./mushaf-surah-header";
import type { QcfVerse } from "@/types/quran-api";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { getSurahPageRange } from "@/lib/surah-pages";
import { cn } from "@/lib/utils";

const TOTAL_PAGES = 604;
const surahs = surahData as unknown as Surah[];

function buildInitialPages(startPage: number, minPage: number, maxPage: number): number[] {
  const from = Math.max(minPage, startPage - 1);
  const to = Math.min(maxPage, startPage + 1);
  const pages: number[] = [];
  for (let page = from; page <= to; page += 1) {
    pages.push(page);
  }
  return pages;
}

function getSurahBounds(surahId: number | undefined): { min: number; max: number } {
  if (!surahId) return { min: 1, max: TOTAL_PAGES };
  const surah = surahs.find((s) => s.id === surahId);
  if (!surah) return { min: 1, max: TOTAL_PAGES };
  const range = getSurahPageRange(surah);
  if (!range) return { min: 1, max: TOTAL_PAGES };
  return { min: range.start, max: range.end };
}

/**
 * Pick the page MushafView should open on, given an optional surahId. If
 * the user is already on a page within that surah's range we keep their
 * scroll position (resume), otherwise we jump to the surah's first page.
 * Called both for the initial-state computation and the surah-switch
 * effect, so the logic is in one place.
 */
function resolveInitialPage(surahId: number | undefined, storedPage: number): number {
  if (!surahId) return storedPage;
  const surah = surahs.find((s) => s.id === surahId);
  if (!surah) return storedPage;
  const range = getSurahPageRange(surah);
  if (!range) return storedPage;
  if (storedPage >= range.start && storedPage <= range.end) {
    return storedPage;
  }
  return range.start;
}

/**
 * When opening a surah (not resuming mid-surah), scroll to the surah's
 * inline banner anchor instead of the top of its first mushaf page.
 * Needed on shared pages where the new surah starts halfway down a page
 * that also carries the previous surah's tail (e.g. An-Nahl on page 267).
 */
function shouldScrollToSurahAnchor(surahId: number | undefined, storedPage: number): boolean {
  if (!surahId || surahId === 1 || surahId === 2) return false;
  const surah = surahs.find((s) => s.id === surahId);
  if (!surah) return false;
  const range = getSurahPageRange(surah);
  if (!range) return false;
  // Resume mid-surah: keep the user's scroll position, don't yank to basmallah.
  if (storedPage > range.start && storedPage <= range.end) return false;
  return true;
}

interface MushafViewProps {
  /**
   * When provided (e.g. on `/quran/{surah}`), MushafView treats the surah
   * as its scope: it opens on the surah's first page (or keeps the user's
   * existing scroll position if they're already inside the surah) and
   * marks the surah as last-read so the home "Continue reading" card can
   * find it. Omitting this (e.g. on `/mushaf/{page}`) keeps the legacy
   * "open whatever page is in the store" behaviour.
   */
  surahId?: number;
  /** Deep-link ayah to scroll to and highlight when opening in mushaf mode. */
  targetAyah?: number;
  /**
   * Explicit mushaf page from the URL (e.g. `/mushaf/42`). Takes precedence
   * over the persisted store on mount so juz/page deep links don't flash
   * page 1 while the store catches up.
   */
  entryPage?: number;
}

export function MushafView({ surahId, targetAyah, entryPage }: MushafViewProps = {}) {
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);
  const setMushafPage = useReadingSettingsStore((s) => s.setMushafPage);
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const clearSelection = useVerseSelectionStore((s) => s.clear);
  const activeVerseKey = useAyahTrackerStore((s) => s.activeVerseKey);
  const trackedSurahId = useAyahTrackerStore((s) => s.trackedSurahId);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const playbackActiveVerseKey =
    surahId != null && trackedSurahId === surahId ? activeVerseKey : null;
  const targetVerseKey =
    surahId != null && targetAyah != null && targetAyah >= 1 ? `${surahId}:${targetAyah}` : null;
  const highlightedVerseKey = playbackActiveVerseKey ?? targetVerseKey;
  const lastScrolledAyahRef = useRef<string | null>(null);
  const lastScrolledTargetRef = useRef<string | null>(null);

  // Bounds the scroll window. When surahId is provided we clamp to the
  // surah's first/last mushaf page so the continuous scroll stops at
  // surah boundaries (no infinite cross-surah scroll). When omitted
  // (legacy /mushaf/{page} entrypoint) we fall back to the full 1..604
  // range so that flow still scrolls through the whole Qur'an.
  const { min: minPage, max: maxPage } = useMemo(() => getSurahBounds(surahId), [surahId]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pendingScrollPage = useRef<number | null>(null);
  const pendingScrollAnchor = useRef<number | null>(null);
  const versesByPageRef = useRef<Map<number, QcfVerse[]>>(new Map());

  const openPage = entryPage ?? mushafPage;
  const initialResolvedPage = resolveInitialPage(surahId, openPage);

  const [loadedPages, setLoadedPages] = useState<number[]>(() =>
    buildInitialPages(initialResolvedPage, minPage, maxPage),
  );
  const [visiblePage, setVisiblePage] = useState(initialResolvedPage);
  const [allVerses, setAllVerses] = useState<QcfVerse[]>([]);
  const targetPageLoadedRef = useRef(false);
  const didScheduleInitialScrollRef = useRef(false);

  const scheduleScrollForPage = useCallback(
    (page: number, storedPage: number): void => {
      const scrollToAnchor = shouldScrollToSurahAnchor(surahId, storedPage);
      pendingScrollPage.current = !scrollToAnchor && page > 1 ? page : null;
      pendingScrollAnchor.current = scrollToAnchor && surahId ? surahId : null;
    },
    [surahId],
  );

  useLayoutEffect(() => {
    if (didScheduleInitialScrollRef.current) return;
    didScheduleInitialScrollRef.current = true;
    scheduleScrollForPage(initialResolvedPage, openPage);
  }, [initialResolvedPage, openPage, scheduleScrollForPage]);

  useEffect(() => {
    if (!surahId || !targetAyah || targetPageLoadedRef.current) return;
    const verseKey = `${surahId}:${targetAyah}`;
    targetPageLoadedRef.current = true;

    void fetch(`/api/quran/verses/by_key/${encodeURIComponent(verseKey)}?fields=page_number`)
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { verse?: { page_number?: number } } | null) => {
        const page = body?.verse?.page_number;
        if (!page || page < minPage || page > maxPage) return;
        setMushafPage(page);
        setVisiblePage(page);
        setLoadedPages(buildInitialPages(page, minPage, maxPage));
      })
      .catch(() => {
        targetPageLoadedRef.current = false;
      });
  }, [surahId, targetAyah, minPage, maxPage, setMushafPage]);

  // Always include page 1 in the font-load set: the KFGQPC p1-v2 font
  // owns the decorative basmallah glyphs (PUA codepoints U+FC41..U+FC44)
  // that <MushafBasmallah> renders on every surah-start page, so we want
  // it loaded even when the user is reading, say, Al-A'raf at page 151
  // where page 1 is otherwise miles out of the visible window.
  const fontPages = useMemo(() => [...new Set([1, ...loadedPages])], [loadedPages]);
  const fontResolver = useMushafFontResolver(fontPages);

  const registerPageRef = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    if (element) {
      pageRefs.current.set(pageNumber, element);
    } else {
      pageRefs.current.delete(pageNumber);
    }
  }, []);

  const handleVersesLoaded = useCallback(
    (pageNumber: number, verses: QcfVerse[]) => {
      versesByPageRef.current.set(pageNumber, verses);
      setAllVerses(loadedPages.flatMap((page) => versesByPageRef.current.get(page) ?? []));
    },
    [loadedPages],
  );

  useEffect(() => {
    setAllVerses(loadedPages.flatMap((page) => versesByPageRef.current.get(page) ?? []));
  }, [loadedPages]);

  // Both append/prepend respect the surah bounds. When scoped to a surah
  // the scroll naturally stops at the surah's last page rather than
  // bleeding into the next surah — the user must use the surah selector
  // (or the home/sidebar Continue-reading cards) to move between surahs.
  const appendNextPage = useCallback(() => {
    const lastPage = loadedPages[loadedPages.length - 1];
    if (lastPage == null || lastPage >= maxPage) return;
    const nextPage = lastPage + 1;
    setLoadedPages((current) => (current.includes(nextPage) ? current : [...current, nextPage]));
  }, [loadedPages, maxPage]);

  const prependPreviousPage = useCallback(() => {
    const firstPage = loadedPages[0];
    if (firstPage == null || firstPage <= minPage) return;
    const previousPage = firstPage - 1;
    setLoadedPages((current) =>
      current.includes(previousPage) ? current : [previousPage, ...current],
    );
  }, [loadedPages, minPage]);

  useEffect(() => {
    return () => clearSelection();
  }, [clearSelection]);

  // Persist "last surah read" so the home/sidebar Continue-reading
  // cards can deep-link back here. The actual "switch surah → reset
  // window" handling lives outside this component: <ReaderContent>
  // keys MushafView by surahId, so navigating between surahs cleanly
  // remounts with fresh state from the lazy useState initializers
  // above. That avoids an in-effect setState cascade.
  useEffect(() => {
    if (!surahId) return;
    (useReadingSettingsStore.getState() as ReadingSettingsState).markSurahRead(surahId);
  }, [surahId]);

  // Anchor-scroll: land on the surah banner once verses load and the
  // inline header mounts. Re-runs when `allVerses` updates (i.e. after
  // the page-section fetch completes) — no MutationObserver needed.
  useEffect(() => {
    const targetSurah = pendingScrollAnchor.current;
    if (targetSurah == null) return;
    const node = document.getElementById(mushafSurahAnchorId(targetSurah));
    if (!node) return;
    if (typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ block: "start" });
    }
    pendingScrollAnchor.current = null;
  }, [loadedPages, allVerses]);

  useEffect(() => {
    const target = pendingScrollPage.current;
    if (target == null) return;
    const node = pageRefs.current.get(target);
    if (!node) return;
    // JSDOM (and some older test environments) don't implement
    // `scrollIntoView`; guard so unit tests don't blow up on a side
    // effect they don't care about. Real browsers always have it.
    if (typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ block: "start" });
    }
    pendingScrollPage.current = null;
  }, [loadedPages]);

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

  useEffect(() => {
    if (!isPlaying || !playbackActiveVerseKey) {
      lastScrolledAyahRef.current = null;
      return;
    }
    if (lastScrolledAyahRef.current === playbackActiveVerseKey) return;

    const verse = allVerses.find((entry) => entry.verse_key === playbackActiveVerseKey);
    if (!verse) return;

    const pageEl = pageRefs.current.get(verse.page_number);
    if (!pageEl) return;

    lastScrolledAyahRef.current = playbackActiveVerseKey;
    pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [playbackActiveVerseKey, allVerses, isPlaying]);

  useEffect(() => {
    if (!targetVerseKey) {
      lastScrolledTargetRef.current = null;
      return;
    }
    if (lastScrolledTargetRef.current === targetVerseKey) return;

    const verse = allVerses.find((entry) => entry.verse_key === targetVerseKey);
    if (!verse) return;

    const line = document.querySelector(`[data-verse-key="${targetVerseKey}"]`);
    if (line && typeof line.scrollIntoView === "function") {
      line.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const pageEl = pageRefs.current.get(verse.page_number);
      pageEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    lastScrolledTargetRef.current = targetVerseKey;
  }, [targetVerseKey, allVerses]);

  const pageWidthScale = fontResolver.config.mushafPageWidthScale;
  const pageClass = pageWidthScale ? "mx-auto w-full" : MUSHAF_PAGE_CLASS;
  const pageStyle = pageWidthScale ? { maxWidth: `${pageWidthScale * fontSize}rem` } : undefined;

  return (
    <div className="relative flex h-full flex-col">
      <ReaderPlaybackSync surahId={surahId ?? 0} scrollContainerRef={scrollContainerRef} />
      <div className="border-border sticky top-0 z-10 border-b bg-[var(--background)]/95 px-4 py-2 backdrop-blur-sm">
        <div
          className={cn(`${pageClass} flex items-center justify-between gap-3`)}
          style={pageStyle}
        >
          <span className="text-muted-foreground text-sm">Mushaf</span>
          <span className="text-sm font-medium tabular-nums">
            Page {visiblePage} / {TOTAL_PAGES}
          </span>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className={cn(`${pageClass} flex flex-col px-4 py-6`)} style={pageStyle}>
          {loadedPages.map((pageNumber, index) => (
            <div key={pageNumber}>
              <MushafPageSection
                pageNumber={pageNumber}
                fontResolver={fontResolver}
                fontSize={`${fontSize}rem`}
                playbackActiveVerseKey={highlightedVerseKey}
                onVersesLoaded={handleVersesLoaded}
                registerPageRef={registerPageRef}
                onReachTop={prependPreviousPage}
                onReachBottom={appendNextPage}
                showTopSentinel={index === 0 && pageNumber > minPage}
                showBottomSentinel={index === loadedPages.length - 1 && pageNumber < maxPage}
              />
              {index < loadedPages.length - 1 ? (
                <div className="my-8 border-t border-[var(--text-alpha-10)]" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <MushafActionBar verses={allVerses} />
    </div>
  );
}
