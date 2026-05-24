"use client";

import { useEffect, useState } from "react";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { BookmarkToggle } from "./bookmark-toggle";
import { HighlightPicker } from "./highlight-picker";
import { NoteEditorButton } from "./note-editor";
import { TafsirSheet } from "./tafsir-sheet";
import type { QcfVerse } from "@/types/quran-api";

function buildArabicText(verse: QcfVerse): string {
  return verse.words
    .map((w) => w.qpc_uthmani_hafs ?? w.text_uthmani ?? "")
    .join(" ")
    .trim();
}

const COMMON =
  "text-foreground rounded-full p-2 transition-colors hover:bg-[var(--text-alpha-10)] relative";

const TOOLBAR_GAP = 8;

export function MushafActionBar({ verses }: { verses: QcfVerse[] }) {
  const selectedVerseKey = useVerseSelectionStore((s) => s.selectedVerseKey);
  const anchorRect = useVerseSelectionStore((s) => s.anchorRect);
  const clear = useVerseSelectionStore((s) => s.clear);
  const [copied, setCopied] = useState(false);
  const [tafsirOpen, setTafsirOpen] = useState(false);
  // Position above the clicked word using CSS transform for centering.
  // anchorRect is in document coordinates (includes scrollY).
  const anchorCenterX = anchorRect ? anchorRect.left + anchorRect.width / 2 : 0;
  const anchorTopY = anchorRect ? anchorRect.top - TOOLBAR_GAP - 44 : 0;

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") clear();
    }
    if (selectedVerseKey) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedVerseKey, clear]);

  if (!selectedVerseKey) return null;

  const verse = verses.find((v) => v.verse_key === selectedVerseKey);
  if (!verse) return null;

  const arabicText = buildArabicText(verse);
  const shareText = `${arabicText}\n\n— Quran ${verse.verse_key}`;

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore clipboard failures.
    }
  }

  async function handleShare(): Promise<void> {
    if (!verse) return;
    const url = `${window.location.origin}/quran/${verse.chapter_id}/${verse.verse_number}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: `Verse ${verse.verse_key}`, text: shareText, url });
        return;
      } catch {
        // Fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore.
    }
  }

  return (
    <div
      role="toolbar"
      aria-label={`Actions for verse ${verse.verse_key}`}
      className="bg-background border-border pointer-events-auto absolute z-30 flex items-center gap-1 rounded-full border px-2 py-1.5 shadow-xl"
      style={
        anchorRect
          ? { top: anchorTopY, left: anchorCenterX, transform: "translateX(-50%)" }
          : { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)" }
      }
    >
      <span className="text-muted-foreground px-2 text-xs font-medium tabular-nums">
        {verse.verse_key}
      </span>
      <BookmarkToggle verseKey={verse.verse_key} className={COMMON} />
      <button
        onClick={() => setTafsirOpen(true)}
        aria-label={`Tafsir for ${verse.verse_key}`}
        className={COMMON}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </button>
      <HighlightPicker verseKey={verse.verse_key} className={COMMON} />
      <NoteEditorButton verseKey={verse.verse_key} className={COMMON} />
      <button
        onClick={() => void handleCopy()}
        aria-label={`Copy ${verse.verse_key}`}
        className={COMMON}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
        </svg>
      </button>
      <button
        onClick={() => void handleShare()}
        aria-label={`Share ${verse.verse_key}`}
        className={COMMON}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0 0-6 3 3 0 0 0-3 3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15.08l7.05 4.11c-.05.23-.09.46-.09.7 0 1.65 1.35 3 3 3a3 3 0 1 0 .04-6.81z" />
        </svg>
      </button>
      {copied ? (
        <span role="status" aria-live="polite" className="text-muted-foreground px-1 text-[10px]">
          Copied
        </span>
      ) : null}
      <button
        onClick={clear}
        aria-label="Close verse actions"
        className="text-muted-foreground hover:text-foreground ml-1 rounded-full p-2 transition-colors hover:bg-[var(--text-alpha-10)]"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
      <TafsirSheet verseKey={verse.verse_key} open={tafsirOpen} onOpenChange={setTafsirOpen} />
    </div>
  );
}
