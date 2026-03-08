'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface NoteDialogProps {
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  initialNote?: string;
  isEditing?: boolean;
  onSave: (verseKey: string, surahNumber: number, ayahNumber: number, content: string) => Promise<void>;
  onUpdate?: (noteId: string, content: string) => Promise<void>;
  onDelete?: (verseKey: string, noteId: string) => Promise<void>;
  onCancel: () => void;
  noteId?: string;
}

export function NoteDialog({
  verseKey,
  surahNumber,
  ayahNumber,
  initialNote = '',
  isEditing = false,
  onSave,
  onUpdate,
  onDelete,
  onCancel,
  noteId
}: NoteDialogProps) {
  const [content, setContent] = useState(initialNote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContent(initialNote);
  }, [initialNote]);

  const canSave = content.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || loading) return;

    setLoading(true);
    try {
      if (isEditing && onUpdate && noteId) {
        await onUpdate(noteId, content.trim());
      } else {
        await onSave(verseKey, surahNumber, ayahNumber, content.trim());
      }
      onCancel();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !onDelete || !noteId || loading) return;

    setLoading(true);
    try {
      await onDelete(verseKey, noteId);
      onCancel();
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text mb-4">
          {isEditing ? 'Edit Note' : 'Add Note'}
        </h3>

        <div className="mb-4">
          <p className="text-sm text-secondary mb-3">
            Verse {surahNumber}:{ayahNumber}
          </p>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            rows={6}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-text placeholder-hint focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
            maxLength={2000}
            disabled={loading}
            autoFocus
          />
          <p className="text-xs text-hint mt-1">
            {content.length}/2000 characters
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>

          {isEditing && onDelete && (
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Delete'
              )}
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={!canSave || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                {isEditing ? 'Update' : 'Save'} Note
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}