'use client';

import { useState, useEffect } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { useTranslationStore } from '@/stores/useTranslationStore';
import { useVerseAnnotationStore } from '@/stores/useVerseAnnotationStore';
import { getTranslationForVerse } from '@/lib/translationService';
import { TranslationDisplay } from '@/components/translations/TranslationDisplay';
import { TranslationToggle } from '@/components/translations/TranslationToggle';
import { TranslationErrorBoundary } from '@/components/translations/TranslationErrorBoundary';
import { VerseActions } from '@/components/collection/VerseActions';
import { HighlightColor, HIGHLIGHT_COLORS } from '@/types/verse-annotations';
import { cn } from '@/lib/cn';
import type { Verse } from "@/types/quran";

interface VerseDisplayProps {
  verse: Verse;
  showTranslation?: boolean;
  surahNumber: number;
}

export function VerseDisplay({ verse, showTranslation = false, surahNumber }: VerseDisplayProps) {
  const [showActions, setShowActions] = useState(false);

  // Translation functionality
  const { showTranslations, selectedTranslation } = useTranslationStore();

  // Verse annotation functionality
  const {
    loadAnnotationsForSurah,
    isBookmarked,
    hasNote,
    getHighlightColor,
    addBookmark,
    removeBookmark,
    addNote,
    updateNote,
    removeNote,
    setHighlight,
    removeHighlight,
  } = useVerseAnnotationStore();

  // Load annotations when component mounts or surah changes
  useEffect(() => {
    loadAnnotationsForSurah(surahNumber);
  }, [surahNumber, loadAnnotationsForSurah]);

  // Get verse annotation state
  const verseIsBookmarked = isBookmarked(verse.verse_key);
  const verseHasNote = hasNote(verse.verse_key);
  const verseHighlightColor = getHighlightColor(verse.verse_key);

  // Get translation data with error handling
  const translation = (() => {
    try {
      return selectedTranslation && showTranslations
        ? getTranslationForVerse(verse.verse_key, selectedTranslation)
        : null;
    } catch (error) {
      console.error('Error fetching translation in VerseDisplay:', error);
      return null;
    }
  })();

  // Verse annotation handlers
  const handleBookmarkToggle = async (verseKey: string, surahNumber: number, ayahNumber: number, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      await removeBookmark(verseKey);
    } else {
      await addBookmark(verseKey, surahNumber, ayahNumber);
    }
  };

  const handleHighlight = async (verseKey: string, surahNumber: number, ayahNumber: number, color: HighlightColor) => {
    await setHighlight(verseKey, surahNumber, ayahNumber, color);
  };

  const handleRemoveHighlight = async (verseKey: string) => {
    await removeHighlight(verseKey);
  };

  const handleAddNote = async (verseKey: string, surahNumber: number, ayahNumber: number, content: string) => {
    await addNote(verseKey, surahNumber, ayahNumber, content);
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    await updateNote(noteId, content);
  };

  const handleDeleteNote = async (verseKey: string, noteId: string) => {
    await removeNote(verseKey, noteId);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(verse.text);
    // TODO: Show toast notification
  };

  // Get highlight background style
  const highlightStyle = verseHighlightColor
    ? { backgroundColor: HIGHLIGHT_COLORS[verseHighlightColor] }
    : {};

  return (
    <div
      className={cn(
        "group relative rounded-lg p-4 transition-colors hover:bg-[color:var(--color-hover)]"
      )}
      style={highlightStyle}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--color-card-border)] text-sm">
          {verse.ayah_number}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex-1 text-right text-xl leading-relaxed font-normal text-[color:var(--color-label)]" dir="rtl">
              {verse.text}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <TranslationErrorBoundary>
                <TranslationToggle />
              </TranslationErrorBoundary>
            </div>
          </div>

          {/* Legacy translation support */}
          {showTranslation && verse.translation && (
            <p className="text-base text-[color:var(--color-hint)] leading-relaxed">
              {verse.translation}
            </p>
          )}

          {/* New translation system */}
          {showTranslations && (
            <TranslationErrorBoundary>
              <TranslationDisplay
                translation={translation}
                className="mt-2"
              />
            </TranslationErrorBoundary>
          )}
        </div>
      </div>

      {showActions && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] p-1 shadow-md">
          <VerseActions
            verseKey={verse.verse_key}
            surahNumber={surahNumber}
            ayahNumber={verse.ayah_number}
            isBookmarked={verseIsBookmarked}
            hasNote={verseHasNote}
            highlightColor={verseHighlightColor}
            onBookmarkToggle={handleBookmarkToggle}
            onHighlight={handleHighlight}
            onRemoveHighlight={handleRemoveHighlight}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />

          <div className="h-4 w-px bg-[color:var(--color-divider)]" />

          <IconButton
            onClick={handleShare}
            size="sm"
            title="Share verse"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </IconButton>

          <IconButton
            onClick={handleCopy}
            size="sm"
            title="Copy verse"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </IconButton>
        </div>
      )}
    </div>
  );
}