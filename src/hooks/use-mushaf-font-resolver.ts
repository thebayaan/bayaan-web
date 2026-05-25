"use client";

import { useMemo } from "react";
import {
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

  return useMemo(
    () =>
      createMushafFontResolver(config, loader, {
        fontPalette:
          quranFontId === "qcf_tajweed_v4"
            ? `--mushaf-tajweed-${tajweedTheme}`
            : undefined,
      }),
    [config, loader, quranFontId, tajweedTheme],
  );
}

export function useMushafFontResolverForId(pageNumbers: number[], fontId: MushafFontId) {
  const config = getMushafFontConfig(fontId);
  const loader = useMushafFont(pageNumbers, fontId);

  return useMemo(() => createMushafFontResolver(config, loader), [config, loader]);
}
