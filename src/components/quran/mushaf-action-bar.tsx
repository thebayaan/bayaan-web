"use client";

import { useEffect, useState } from "react";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";
import { BookmarkToggle } from "./bookmark-toggle";
import { HighlightPicker } from "./highlight-picker";
import { NoteEditorButton } from "./note-editor";
import type { QcfVerse } from "@/types/quran-api";

function buildArabicText(verse: QcfVerse): string {
  return verse.words
    .map((w) => w.qpc_uthmani_hafs ?? w.text_uthmani ?? "")
    .join(" ")
    .trim();
}

const COMMON =
  "text-foreground rounded-full p-2 transition-colors hover:bg-[var(--text-alpha-10)] relative";

export function MushafActionBar({ verses }: { verses: QcfVerse[] }) {
  const selectedVerseKey = useVerseSelectionStore((s) => s.selectedVerseKey);
  const clear = useVerseSelectionStore((s) => s.clear);
  const [copied, setCopied] = useState(false);

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
      // Ignore clipboard failures (non-HTTPS iframe, permissions).
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
      className="bg-background border-border pointer-events-auto fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border px-2 py-1.5 shadow-xl"
    >
      <span className="text-muted-foreground px-2 text-xs font-medium tabular-nums">
        {verse.verse_key}
      </span>
      <BookmarkToggle verseKey={verse.verse_key} className={COMMON} />
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
    </div>
  );
}
