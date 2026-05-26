"use client";

import { useMemo } from "react";
import {
  BASMALLAH_GLYPH_FONT_ID,
  BASMALLAH_GLYPH_PAGE,
  createMushafFontResolver,
  getMushafFontConfig,
  resolveTajweedTheme,
  type MushafFontId,
} from "@/lib/mushaf-fonts";
import { useMushafFont } from "@/hooks/use-mushaf-font";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { getResolvedTheme, useThemeStore } from "@/stores/theme-store";

export function useMushafFontResolver(pageNumbers: number[]) {
  const quranFontId = useReadingSettingsStore((s) => s.quranFontId);
  const lightThemeId = useReadingSettingsStore((s) => s.lightThemeId);
  const themeMode = useThemeStore((s) => s.themeMode);
  const resolvedTheme = getResolvedTheme(themeMode);
  const colorMode = resolvedTheme === "dark" ? "dark" : "light";
  const config = getMushafFontConfig(quranFontId);
  const tajweedTheme = resolveTajweedTheme(colorMode, lightThemeId, resolvedTheme);
  const loader = useMushafFont(pageNumbers, quranFontId, tajweedTheme);
  // Always preload the ornate KFGQPC basmallah glyph so it can render in
  // contexts where page 1's main font isn't otherwise needed — e.g. the
  // list-mode reader on any surah > 1, where the native glyph path requires
  // page 1 to be loaded for the active mushaf font.
  const basmallahLoader = useMushafFont(
    [BASMALLAH_GLYPH_PAGE],
    BASMALLAH_GLYPH_FONT_ID,
    tajweedTheme,
  );

  return useMemo(
    () => createMushafFontResolver(config, loader, { tajweedTheme, basmallahLoader }),
    [config, loader, tajweedTheme, basmallahLoader],
  );
}

export function useMushafFontResolverForId(pageNumbers: number[], fontId: MushafFontId) {
  const config = getMushafFontConfig(fontId);
  const loader = useMushafFont(pageNumbers, fontId);

  return useMemo(() => createMushafFontResolver(config, loader), [config, loader]);
}
