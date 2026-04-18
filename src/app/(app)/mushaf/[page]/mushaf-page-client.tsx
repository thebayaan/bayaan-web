"use client";

import { useEffect } from "react";
import { MushafView } from "@/components/quran/mushaf-view";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

interface MushafPageClientProps {
  initialPage: number;
}

export function MushafPageClient({ initialPage }: MushafPageClientProps) {
  const setMushafPage = useReadingSettingsStore((s) => s.setMushafPage);

  useEffect(() => {
    setMushafPage(initialPage);
  }, [initialPage, setMushafPage]);

  return <MushafView />;
}
