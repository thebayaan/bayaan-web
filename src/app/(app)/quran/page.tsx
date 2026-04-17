"use client";

import { useState } from "react";
import { SurahIndexGrid } from "@/components/quran/surah-index-grid";
import { MushafView } from "@/components/quran/mushaf-view";

type View = "grid" | "mushaf";

export default function QuranPage() {
  const [view, setView] = useState<View>("grid");

  return (
    <div className="relative">
      <div className="bg-background sticky top-0 z-20 flex justify-end gap-1 px-10 pt-6">
        <div className="border-border bg-surface-sunken inline-flex items-center rounded-full border p-1">
          <ViewToggleButton active={view === "grid"} onClick={() => setView("grid")}>
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
            <span>List</span>
          </ViewToggleButton>
          <ViewToggleButton active={view === "mushaf"} onClick={() => setView("mushaf")}>
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
            <span>Mushaf</span>
          </ViewToggleButton>
        </div>
      </div>
      {view === "grid" ? <SurahIndexGrid /> : <MushafView />}
    </div>
  );
}

function ViewToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`duration-fast ease-standard flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
