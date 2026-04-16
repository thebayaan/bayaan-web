"use client";

import { useState } from "react";
import Link from "next/link";
import type { Surah } from "@/types/quran";
import { ReadingSettingsSheet } from "./reading-settings-sheet";

interface Props {
  surah: Surah;
  page?: number;
  juz?: number;
}

export function ReadingSubHeader({ surah, page, juz }: Props): React.JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="border-border-divider bg-surface/95 sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b px-10 py-3 backdrop-blur-md">
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
          <div className="text-muted-foreground flex items-center gap-3 text-xs font-medium">
            <span>Page {page}</span>
            {juz !== undefined && (
              <>
                <span className="bg-border-divider h-3 w-px" />
                <span>Juz {juz}</span>
              </>
            )}
          </div>
        )}

        <div className="flex-1" />

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
    </>
  );
}
