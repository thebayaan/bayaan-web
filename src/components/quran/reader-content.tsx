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
    // Pass surahId so MushafView jumps to (or resumes within) this
    // surah's mushaf-page range instead of stubbornly showing whatever
    // page the global store happens to be on. We also use surahId as
    // the React `key` so navigating between surahs forces a remount —
    // that's how the new entry page (and bounded page window) takes
    // effect cleanly, without an in-effect setState dance inside
    // MushafView. The verses themselves are cached by react-query so
    // remounting doesn't trigger a network refetch.
    return <MushafView key={surahId} surahId={surahId} />;
  }
  return <ReadingView surahId={surahId} targetAyah={targetAyah} />;
}
