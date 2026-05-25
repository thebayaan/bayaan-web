"use client";

import { useState } from "react";
import type { QcfVerse } from "@/types/quran-api";
import { BookmarkToggle } from "./bookmark-toggle";
import { HighlightPicker } from "./highlight-picker";
import { NoteEditorButton } from "./note-editor";
import { TafsirSheet } from "./tafsir-sheet";
import { ReciterPickerDialog } from "./reciter-picker-dialog";
import { usePlayFromAyah } from "@/hooks/use-play-from-ayah";
import { CopyIcon, PlayIcon, ShareIcon, TafseerIcon } from "@/components/icons";

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const { playFromAyah, canPlayFromAyah, availableReciters, resolvedReciter } = usePlayFromAyah(
    surahId,
    surahName,
  );

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

  async function startPlayFromAyah(choice?: (typeof availableReciters)[number]): Promise<void> {
    setPlayError(null);
    setIsPlayingAyah(true);
    try {
      await playFromAyah(verse, choice);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start playback from this ayah.";
      setPlayError(message);
      setTimeout(() => setPlayError(null), 2500);
    } finally {
      setIsPlayingAyah(false);
    }
  }

  async function handlePlayFromAyah(): Promise<void> {
    if (!resolvedReciter) {
      setPickerOpen(true);
      return;
    }
    await startPlayFromAyah();
  }

  async function handlePickReciter(choice: (typeof availableReciters)[number]): Promise<void> {
    setPickerOpen(false);
    await startPlayFromAyah(choice);
  }

  const playLabel = resolvedReciter
    ? `Play from ${verse.verse_key} (${resolvedReciter.reciter.name})`
    : `Play from ${verse.verse_key} — choose a reciter`;

  return (
    <>
      <div
        className="flex items-center gap-0.5"
        aria-label={`Actions for verse ${verse.verse_key}`}
      >
        <button
          type="button"
          onClick={() => void handlePlayFromAyah()}
          disabled={!canPlayFromAyah || isPlayingAyah}
          aria-label={playLabel}
          title={playLabel}
          className={COMMON_BUTTON}
        >
          <PlayIcon size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setTafsirOpen(true)}
          aria-label={`Tafsir for ${verse.verse_key}`}
          title={`Tafsir for ${verse.verse_key}`}
          className={COMMON_BUTTON}
        >
          <TafseerIcon size={14} aria-hidden="true" />
        </button>
        <BookmarkToggle verseKey={verse.verse_key} className={COMMON_BUTTON} />
        <HighlightPicker verseKey={verse.verse_key} className={COMMON_BUTTON} />
        <NoteEditorButton verseKey={verse.verse_key} className={COMMON_BUTTON} />
        <button
          onClick={() => void handleCopy()}
          aria-label={`Copy ${verse.verse_key}`}
          className={COMMON_BUTTON}
        >
          <CopyIcon size={14} aria-hidden="true" />
        </button>
        <button
          onClick={() => void handleShare()}
          aria-label={`Share ${verse.verse_key}`}
          className={COMMON_BUTTON}
        >
          <ShareIcon size={14} aria-hidden="true" />
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
      <ReciterPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        description={`Pick a reciter to play from verse ${verse.verse_key}. Your choice is remembered.`}
        reciters={availableReciters}
        selectedId={resolvedReciter?.reciter.id ?? null}
        onPick={(choice) => void handlePickReciter(choice)}
      />
      <TafsirSheet verseKey={verse.verse_key} open={tafsirOpen} onOpenChange={setTafsirOpen} />
    </>
  );
}
