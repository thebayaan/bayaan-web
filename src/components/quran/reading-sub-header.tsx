"use client";

import { useMemo, useState } from "react";
import type { Surah } from "@/types/quran";
import { getHizbForPage, getJuzForPage } from "@/data/juz-data";
import { ReadingSettings } from "./reading-settings-sheet";
import { ReaderPlayChip } from "./reader-play-chip";
import { PagePicker } from "./page-picker";
import { SurahPicker } from "./surah-picker";
import { ListViewPillIcon, MushafPagePillIcon } from "@/components/icons";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

interface Props {
  surah: Surah;
}

export function ReadingSubHeader({ surah }: Props): React.JSX.Element {
  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const viewMode = useReadingSettingsStore((s) => s.viewMode);
  const setViewMode = useReadingSettingsStore((s) => s.setViewMode);
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);

  const { page, juz, hizb } = useMemo(() => {
    if (viewMode !== "mushaf") return { page: undefined, juz: undefined, hizb: undefined };
    return {
      page: mushafPage,
      juz: getJuzForPage(mushafPage),
      hizb: getHizbForPage(mushafPage),
    };
  }, [viewMode, mushafPage]);

  return (
    <>
      <div className="border-border-divider bg-surface/95 sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b px-4 py-3 backdrop-blur-md sm:gap-4 sm:px-10">
        <SurahPicker surah={surah} />

        {page !== undefined && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => setPagePickerOpen(true)}
              className="hover:text-foreground transition-colors"
              aria-label={`Go to page ${page}`}
            >
              Page {page}
            </button>
            {juz !== undefined && (
              <>
                <span className="bg-border-divider h-3 w-px" />
                <span>Juz {juz}</span>
              </>
            )}
            {hizb !== undefined && (
              <>
                <span className="bg-border-divider h-3 w-px" />
                <span>Hizb {hizb}</span>
              </>
            )}
          </div>
        )}

        <div className="flex-1" />

        <ReaderPlayChip surahId={surah.id} surahName={surah.name} />

        <div className="border-border bg-surface-sunken inline-flex items-center rounded-full border p-1">
          <ViewModeButton
            active={viewMode === "reading"}
            onClick={() => setViewMode("reading")}
            label="List"
            icon={<ListViewPillIcon size={14} />}
          />
          <ViewModeButton
            active={viewMode === "mushaf"}
            onClick={() => setViewMode("mushaf")}
            label="Mushaf"
            icon={<MushafPagePillIcon size={14} />}
          />
        </div>

        <button
          type="button"
          onClick={() => setPagePickerOpen(true)}
          aria-label="Go to mushaf page"
          className="border-border hover:bg-surface-raised duration-fast ease-standard hidden h-9 items-center rounded-lg border px-3 text-xs font-semibold transition-colors sm:inline-flex"
        >
          Go to page
        </button>

        <ReadingSettings />
      </div>

      <PagePicker open={pagePickerOpen} onOpenChange={setPagePickerOpen} surahId={surah.id} />
    </>
  );
}

function ViewModeButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`duration-fast ease-standard flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
