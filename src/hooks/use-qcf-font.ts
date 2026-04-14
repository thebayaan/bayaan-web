"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const QCF_FONT_CDN = "https://static.qurancdn.com/fonts/quran/hafs/v2/woff2";
const loadedFonts = new Set<number>();

/** Exposed only for test teardown — do not call in production code. */
export function _clearLoadedFontsForTesting(): void {
  loadedFonts.clear();
}

export function useQcfFont(pageNumbers: number[]): {
  isPageFontLoaded: (pageNum: number) => boolean;
  getFontFamily: (pageNum: number) => string;
  loadedPages: Set<number>;
} {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(
    () => new Set(loadedFonts),
  );
  const loadingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const toLoad = pageNumbers.filter(
      (p) => !loadedFonts.has(p) && !loadingRef.current.has(p),
    );
    if (toLoad.length === 0) return;

    toLoad.forEach((pageNum) => {
      loadingRef.current.add(pageNum);
      const fontName = `p${pageNum}-v2`;
      const fontUrl = `url('${QCF_FONT_CDN}/p${pageNum}.woff2') format('woff2')`;
      const fontFace = new FontFace(fontName, fontUrl);
      document.fonts.add(fontFace);
      fontFace
        .load()
        .then(() => {
          loadedFonts.add(pageNum);
          loadingRef.current.delete(pageNum);
          setLoadedPages((prev) => new Set([...prev, pageNum]));
        })
        .catch((err: unknown) => {
          console.error(`Failed to load QCF font for page ${pageNum}:`, err);
          loadingRef.current.delete(pageNum);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pageNumbers)]);

  const isPageFontLoaded = useCallback(
    (pageNum: number) => loadedPages.has(pageNum),
    [loadedPages],
  );

  const getFontFamily = useCallback(
    (pageNum: number) =>
      loadedPages.has(pageNum) ? `p${pageNum}-v2` : "UthmanicHafs",
    [loadedPages],
  );

  return { isPageFontLoaded, getFontFamily, loadedPages };
}
