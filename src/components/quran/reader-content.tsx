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
  const mushafJumpSeq = useReadingSettingsStore((s) => s.mushafJumpSeq);

  if (viewMode === "mushaf") {
    return (
      <MushafView
        key={`${surahId}:${targetAyah ?? 0}:${mushafJumpSeq}`}
        surahId={surahId}
        targetAyah={targetAyah}
      />
    );
  }
  return <ReadingView surahId={surahId} targetAyah={targetAyah} />;
}
