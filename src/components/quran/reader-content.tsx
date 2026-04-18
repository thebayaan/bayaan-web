"use client";

import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { ReadingView } from "./reading-view";
import { MushafView } from "./mushaf-view";

interface Props {
  surahId: number;
  targetAyah?: number;
}

export function ReaderContent({ surahId, targetAyah }: Props) {
  const viewMode = useReadingSettingsStore((s) => s.viewMode);
  if (viewMode === "mushaf") {
    return <MushafView />;
  }
  return <ReadingView surahId={surahId} targetAyah={targetAyah} />;
}
