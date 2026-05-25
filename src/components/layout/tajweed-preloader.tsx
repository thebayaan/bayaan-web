"use client";

import { useEffect } from "react";
import { useTajweedStore } from "@/stores/tajweed-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

/** Preloads tajweed rule data when the user has coloring enabled. */
export function TajweedPreloader(): null {
  const showTajweed = useReadingSettingsStore((s) => s.showTajweed);
  const ensureLoaded = useTajweedStore((s) => s.ensureLoaded);

  useEffect(() => {
    if (showTajweed) void ensureLoaded();
  }, [showTajweed, ensureLoaded]);

  return null;
}
