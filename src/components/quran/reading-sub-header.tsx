"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Surah } from "@/types/quran";
import { getHizbForPage, getJuzForPage } from "@/data/juz-data";
import { ReadingSettingsSheet } from "./reading-settings-sheet";
import { ReaderPlayChip } from "./reader-play-chip";
import { PagePicker } from "./page-picker";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

interface Props {
  surah: Surah;
}

export function ReadingSubHeader({ surah }: Props): React.JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        <Link
          href="/quran"
          className="border-border bg-surface hover:bg-surface-raised duration-fast ease-standard flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors"
        >
          <span className="bg-brand-light text-brand-main flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-bold tabular-nums">
            {String(surah.id).padStart(2, "0")}
          </span>
          <span className="flex flex-col items-start">
            <span className="text-foreground text-sm leading-none font-bold">{surah.name}</span>
            <span className="text-muted-foreground mt-0.5 text-[11px] leading-none font-medium">
              {surah.translated_name_english} · {surah.verses_count} ayahs
            </span>
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground ml-1"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Link>

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
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            }
          />
          <ViewModeButton
            active={viewMode === "mushaf"}
            onClick={() => setViewMode("mushaf")}
            label="Mushaf"
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            }
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

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Reading settings"
          className="border-border hover:bg-surface-raised duration-fast ease-standard flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <ReadingSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
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
