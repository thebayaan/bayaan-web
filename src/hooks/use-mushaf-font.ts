"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  type MushafFontId,
  getMushafFontConfig,
  getPageFontCdnUrl,
  getPageFontName,
  resolveTajweedTheme,
} from "@/lib/mushaf-fonts";

/** Module-level cache keyed by `${fontId}:${page}` or `${fontId}:static`. */
const loadedFontKeys = new Set<string>();

/** Exposed only for test teardown — do not call in production code. */
export function _clearLoadedFontsForTesting(): void {
  loadedFontKeys.clear();
}

function cacheKey(fontId: MushafFontId, suffix: string): string {
  return `${fontId}:${suffix}`;
}

export function useMushafFont(
  pageNumbers: number[],
  fontId: MushafFontId,
  theme: "light" | "dark" | "sepia" = "light",
): {
  isPageFontLoaded: (pageNum: number) => boolean;
  getFontFamily: (pageNum: number) => string;
  isStaticFontLoaded: boolean;
  loadedPages: Set<number>;
} {
  const config = getMushafFontConfig(fontId);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(() => {
    if (config.rendering !== "glyph-per-page") return new Set();
    const initial = new Set<number>();
    pageNumbers.forEach((page) => {
      if (loadedFontKeys.has(cacheKey(fontId, String(page)))) {
        initial.add(page);
      }
    });
    return initial;
  });
  const [isStaticFontLoaded, setIsStaticFontLoaded] = useState(() =>
    config.rendering === "unicode"
      ? loadedFontKeys.has(cacheKey(fontId, "static"))
      : true,
  );
  const loadingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (config.rendering === "unicode") {
      if (!config.staticFontFamily || !config.staticFontUrl) return;

      const key = cacheKey(fontId, "static");
      if (loadedFontKeys.has(key) || loadingRef.current.has(key)) {
        setIsStaticFontLoaded(true);
        return;
      }

      loadingRef.current.add(key);
      const fontFace = new FontFace(
        config.staticFontFamily,
        `url('${config.staticFontUrl}') format('woff2')`,
      );
      document.fonts.add(fontFace);
      fontFace
        .load()
        .then(() => {
          loadedFontKeys.add(key);
          loadingRef.current.delete(key);
          setIsStaticFontLoaded(true);
        })
        .catch((err: unknown) => {
          console.error(`Failed to load ${config.staticFontFamily} font:`, err);
          loadingRef.current.delete(key);
          setIsStaticFontLoaded(true);
        });
      return;
    }

    const toLoad = pageNumbers.filter((pageNum) => {
      const key = cacheKey(fontId, String(pageNum));
      return !loadedFontKeys.has(key) && !loadingRef.current.has(key);
    });

    if (toLoad.length === 0) return;

    toLoad.forEach((pageNum) => {
      const key = cacheKey(fontId, String(pageNum));
      loadingRef.current.add(key);
      const fontName = getPageFontName(config, pageNum);
      const fontUrl = getPageFontCdnUrl(config, pageNum, theme);
      const fontFace = new FontFace(fontName, `url('${fontUrl}') format('woff2')`);
      document.fonts.add(fontFace);
      fontFace
        .load()
        .then(() => {
          loadedFontKeys.add(key);
          loadingRef.current.delete(key);
          setLoadedPages((prev) => new Set([...prev, pageNum]));
        })
        .catch((err: unknown) => {
          console.error(`Failed to load mushaf font for page ${pageNum}:`, err);
          loadingRef.current.delete(key);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pageNumbers), fontId, theme, config.rendering]);

  const isPageFontLoaded = useCallback(
    (pageNum: number) => {
      if (config.rendering === "unicode") return isStaticFontLoaded;
      return loadedFontKeys.has(cacheKey(fontId, String(pageNum)));
    },
    [config.rendering, fontId, isStaticFontLoaded],
  );

  const getFontFamily = useCallback(
    (pageNum: number) => {
      if (config.rendering === "unicode") {
        return config.staticFontFamily ?? "UthmanicHafs";
      }
      return isPageFontLoaded(pageNum)
        ? getPageFontName(config, pageNum)
        : "UthmanicHafs";
    },
    [config, isPageFontLoaded],
  );

  return { isPageFontLoaded, getFontFamily, isStaticFontLoaded, loadedPages };
}

/** Backward-compatible wrapper defaulting to QCF V2. */
export function useQcfFont(pageNumbers: number[]) {
  return useMushafFont(pageNumbers, "qcf_v2");
}

export function useMushafFontWithTheme(
  pageNumbers: number[],
  fontId: MushafFontId,
  colorMode: "light" | "dark",
  lightThemeId: string,
) {
  const theme = resolveTajweedTheme(colorMode, lightThemeId);
  return useMushafFont(pageNumbers, fontId, theme);
}
