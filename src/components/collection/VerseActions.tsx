'use client';

import { useState } from 'react';
import { HighlightColor } from '@/types/verse-annotations';
import { BookmarkButton } from './BookmarkButton';
import { HighlightSelector } from './HighlightSelector';
import { NoteButton } from './NoteButton';
import { NoteDialog } from './NoteDialog';
import { cn } from '@/lib/cn';

interface VerseActionsProps {
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  isBookmarked: boolean;
  hasNote: boolean;
  highlightColor: HighlightColor | null;
  onBookmarkToggle: (verseKey: string, surahNumber: number, ayahNumber: number, isBookmarked: boolean) => Promise<void>;
  onHighlight: (verseKey: string, surahNumber: number, ayahNumber: number, color: HighlightColor) => Promise<void>;
  onRemoveHighlight: (verseKey: string) => Promise<void>;
  onAddNote: (verseKey: string, surahNumber: number, ayahNumber: number, content: string) => Promise<void>;
  onUpdateNote?: (noteId: string, content: string) => Promise<void>;
  onDeleteNote?: (verseKey: string, noteId: string) => Promise<void>;
  noteId?: string;
  initialNote?: string;
  className?: string;
}

export function VerseActions({
  verseKey,
  surahNumber,
  ayahNumber,
  isBookmarked,
  hasNote,
  highlightColor,
  onBookmarkToggle,
  onHighlight,
  onRemoveHighlight,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  noteId,
  initialNote,
  className
}: VerseActionsProps) {
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  const handleNoteClick = () => {
    setShowNoteDialog(true);
  };

  const handleNoteCancel = () => {
    setShowNoteDialog(false);
  };

  return (
    <>
      <div className={cn('flex items-center gap-1', className)}>
        <BookmarkButton
          verseKey={verseKey}
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          isBookmarked={isBookmarked}
          onToggle={onBookmarkToggle}
        />

        <HighlightSelector
          verseKey={verseKey}
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          currentColor={highlightColor}
          onHighlight={onHighlight}
          onRemoveHighlight={onRemoveHighlight}
        />

        <NoteButton
          hasNote={hasNote}
          onClick={handleNoteClick}
        />
      </div>

      {showNoteDialog && (
        <NoteDialog
          verseKey={verseKey}
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          initialNote={initialNote}
          isEditing={hasNote}
          onSave={onAddNote}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
          onCancel={handleNoteCancel}
          noteId={noteId}
        />
      )}
    </>
  );
}