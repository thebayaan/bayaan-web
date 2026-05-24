"use client";

import { useState } from "react";
import type { QcfVerse } from "@/types/quran-api";
import { BookmarkToggle } from "./bookmark-toggle";
import { HighlightPicker } from "./highlight-picker";
import { NoteEditorButton } from "./note-editor";
import { usePlayFromAyah } from "@/hooks/use-play-from-ayah";

function getVerseText(verse: QcfVerse): string {
  const arabic = verse.words
    .map((w) => w.qpc_uthmani_hafs ?? w.text_uthmani ?? "")
    .join(" ")
    .trim();
  const translation = verse.translations?.[0]?.text?.replace(/<[^>]*>/g, "").trim();
  const parts = [arabic];
  if (translation) parts.push(translation);
  parts.push(`— Quran ${verse.verse_key}`);
  return parts.join("\n\n");
}

const COMMON_BUTTON =
  "text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors hover:bg-[var(--text-alpha-06)] relative disabled:cursor-not-allowed disabled:opacity-40";

interface VerseActionsProps {
  verse: QcfVerse;
  surahId: number;
  surahName: string;
}

export function VerseActions({ verse, surahId, surahName }: VerseActionsProps) {
  const [copied, setCopied] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const [isPlayingAyah, setIsPlayingAyah] = useState(false);
  const { playFromAyah, canPlayFromAyah, resolvedReciter } = usePlayFromAyah(surahId, surahName);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(getVerseText(verse));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard blocked (e.g., non-HTTPS iframe) — ignore.
    }
  }

  async function handleShare(): Promise<void> {
    const text = getVerseText(verse);
    const url = `${window.location.origin}/quran/${verse.chapter_id}/${verse.verse_number}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Verse ${verse.verse_key}`,
          text,
          url,
        });
        return;
      } catch {
        // User cancelled or API missing — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore.
    }
  }

  async function handlePlayFromAyah(): Promise<void> {
    setPlayError(null);
    setIsPlayingAyah(true);
    try {
      await playFromAyah(verse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start playback from this ayah.";
      setPlayError(message);
      setTimeout(() => setPlayError(null), 2500);
    } finally {
      setIsPlayingAyah(false);
    }
  }

  const playLabel = resolvedReciter
    ? `Play from ${verse.verse_key} (${resolvedReciter.reciter.name})`
    : `Play from ${verse.verse_key} — choose a reciter in the header first`;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Actions for verse ${verse.verse_key}`}>
      <button
        type="button"
        onClick={() => void handlePlayFromAyah()}
        disabled={!canPlayFromAyah || isPlayingAyah}
        aria-label={playLabel}
        title={playLabel}
        className={COMMON_BUTTON}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <BookmarkToggle verseKey={verse.verse_key} className={COMMON_BUTTON} />
      <HighlightPicker verseKey={verse.verse_key} className={COMMON_BUTTON} />
      <NoteEditorButton verseKey={verse.verse_key} className={COMMON_BUTTON} />
      <button
        onClick={() => void handleCopy()}
        aria-label={`Copy ${verse.verse_key}`}
        className={COMMON_BUTTON}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
        </svg>
      </button>
      <button
        onClick={() => void handleShare()}
        aria-label={`Share ${verse.verse_key}`}
        className={COMMON_BUTTON}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0 0-6 3 3 0 0 0-3 3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15.08l7.05 4.11c-.05.23-.09.46-.09.7 0 1.65 1.35 3 3 3a3 3 0 1 0 .04-6.81z" />
        </svg>
      </button>
      {copied ? (
        <span role="status" aria-live="polite" className="text-muted-foreground ml-1 text-[10px]">
          Copied
        </span>
      ) : null}
      {playError ? (
        <span
          role="status"
          aria-live="polite"
          className="text-destructive ml-1 max-w-40 text-[10px]"
        >
          {playError}
        </span>
      ) : null}
    </div>
  );
}
