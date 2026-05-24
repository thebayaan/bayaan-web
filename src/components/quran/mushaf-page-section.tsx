"use client";

import { useEffect, useRef } from "react";
import { useVersesByPage } from "@/hooks/use-verses-by-page";
import type { QcfVerse } from "@/types/quran-api";
import type { QcfFontResolver } from "./quran-word";
import { MushafPage } from "./mushaf-page";

interface MushafPageSectionProps {
  pageNumber: number;
  fontResolver: QcfFontResolver;
  fontSize: string;
  onVersesLoaded: (pageNumber: number, verses: QcfVerse[]) => void;
  registerPageRef: (pageNumber: number, element: HTMLDivElement | null) => void;
  onReachBottom?: () => void;
  onReachTop?: () => void;
  showTopSentinel: boolean;
  showBottomSentinel: boolean;
}

export function MushafPageSection({
  pageNumber,
  fontResolver,
  fontSize,
  onVersesLoaded,
  registerPageRef,
  onReachBottom,
  onReachTop,
  showTopSentinel,
  showBottomSentinel,
}: MushafPageSectionProps) {
  const { verses, isLoading } = useVersesByPage(pageNumber);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (verses.length > 0) {
      onVersesLoaded(pageNumber, verses);
    }
  }, [pageNumber, verses, onVersesLoaded]);

  useEffect(() => {
    if (!showTopSentinel || !onReachTop) return;
    const node = topSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onReachTop();
        }
      },
      { rootMargin: "120px 0px 0px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showTopSentinel, onReachTop]);

  useEffect(() => {
    if (!showBottomSentinel || !onReachBottom) return;
    const node = bottomSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onReachBottom();
        }
      },
      { rootMargin: "0px 0px 240px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showBottomSentinel, onReachBottom]);

  return (
    <div
      ref={(element) => registerPageRef(pageNumber, element)}
      data-page={pageNumber}
      className="scroll-mt-4"
    >
      {showTopSentinel ? <div ref={topSentinelRef} className="h-px" aria-hidden="true" /> : null}

      {isLoading ? (
        <div className="mx-auto w-full max-w-[420px] animate-pulse px-6 py-10">
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              className="mx-auto mb-4 h-7 rounded bg-[var(--text-alpha-06)]"
              style={{ width: `${68 + ((index * 11) % 24)}%` }}
            />
          ))}
        </div>
      ) : (
        <MushafPage
          verses={verses}
          pageNumber={pageNumber}
          fontResolver={fontResolver}
          fontSize={fontSize}
        />
      )}

      {showBottomSentinel ? <div ref={bottomSentinelRef} className="h-px" aria-hidden="true" /> : null}
    </div>
  );
}
