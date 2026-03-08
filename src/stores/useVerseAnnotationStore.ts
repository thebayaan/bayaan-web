import { create } from 'zustand';
import { verseAnnotationService } from '@/lib/collectionService';
import { HighlightColor } from '@/types/verse-annotations';

interface VerseAnnotationState {
  loadedSurah: number | null;
  bookmarkedVerseKeys: Set<string>;
  notedVerseKeys: Set<string>;
  highlights: Record<string, HighlightColor>;
  loading: boolean;
  error: string | null;

  loadAnnotationsForSurah: (surahNumber: number) => Promise<void>;

  // Optimistic mutations for bookmarks
  addBookmark: (verseKey: string, surahNumber: number, ayahNumber: number) => Promise<void>;
  removeBookmark: (verseKey: string) => Promise<void>;

  // Note actions
  addNote: (verseKey: string, surahNumber: number, ayahNumber: number, content: string) => Promise<void>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  removeNote: (verseKey: string, noteId: string) => Promise<void>;
  setNoteExists: (verseKey: string, exists: boolean) => void;

  // Highlight actions
  setHighlight: (verseKey: string, surahNumber: number, ayahNumber: number, color: HighlightColor) => Promise<void>;
  removeHighlight: (verseKey: string) => Promise<void>;

  // Query helpers
  isBookmarked: (verseKey: string) => boolean;
  hasNote: (verseKey: string) => boolean;
  getHighlightColor: (verseKey: string) => HighlightColor | null;

  // Utility
  clearError: () => void;
  resetAnnotationsForSurah: () => void;
}

export const useVerseAnnotationStore = create<VerseAnnotationState>((set, get) => ({
  loadedSurah: null,
  bookmarkedVerseKeys: new Set<string>(),
  notedVerseKeys: new Set<string>(),
  highlights: {},
  loading: false,
  error: null,

  loadAnnotationsForSurah: async (surahNumber: number) => {
    const state = get();
    if (state.loading || state.loadedSurah === surahNumber) return;

    set({ loading: true, error: null });

    try {
      const { bookmarks, notes, highlights } =
        await verseAnnotationService.getAnnotationsForSurah(surahNumber);

      const bookmarkedVerseKeys = new Set(bookmarks.map(b => b.verseKey));
      const notedVerseKeys = new Set(notes.map(n => n.verseKey));
      const highlightsRecord: Record<string, HighlightColor> = {};
      highlights.forEach(h => {
        highlightsRecord[h.verseKey] = h.color;
      });

      set({
        loadedSurah: surahNumber,
        bookmarkedVerseKeys,
        notedVerseKeys,
        highlights: highlightsRecord,
        loading: false,
      });
    } catch (error) {
      console.error(
        '[VerseAnnotationStore] Failed to load annotations:',
        error,
      );
      const errorMessage = error instanceof Error ? error.message : 'Failed to load annotations';
      set({ loading: false, error: errorMessage });
    }
  },

  // Bookmark actions
  addBookmark: async (verseKey: string, surahNumber: number, ayahNumber: number) => {
    // Optimistic update
    const newSet = new Set(get().bookmarkedVerseKeys);
    newSet.add(verseKey);
    set({ bookmarkedVerseKeys: newSet, error: null });

    try {
      await verseAnnotationService.addBookmark(verseKey, surahNumber, ayahNumber);
    } catch (error) {
      console.error('[VerseAnnotationStore] Failed to add bookmark:', error);
      // Revert optimistic update
      const revertSet = new Set(get().bookmarkedVerseKeys);
      revertSet.delete(verseKey);
      set({
        bookmarkedVerseKeys: revertSet,
        error: error instanceof Error ? error.message : 'Failed to add bookmark'
      });
      throw error;
    }
  },

  removeBookmark: async (verseKey: string) => {
    // Optimistic update
    const newSet = new Set(get().bookmarkedVerseKeys);
    newSet.delete(verseKey);
    set({ bookmarkedVerseKeys: newSet, error: null });

    try {
      await verseAnnotationService.removeBookmark(verseKey);
    } catch (error) {
      console.error('[VerseAnnotationStore] Failed to remove bookmark:', error);
      // Revert optimistic update
      const revertSet = new Set(get().bookmarkedVerseKeys);
      revertSet.add(verseKey);
      set({
        bookmarkedVerseKeys: revertSet,
        error: error instanceof Error ? error.message : 'Failed to remove bookmark'
      });
      throw error;
    }
  },

  // Note actions
  addNote: async (verseKey: string, surahNumber: number, ayahNumber: number, content: string) => {
    // Optimistic update
    const newSet = new Set(get().notedVerseKeys);
    newSet.add(verseKey);
    set({ notedVerseKeys: newSet, error: null });

    try {
      await verseAnnotationService.addNote(verseKey, surahNumber, ayahNumber, content);
    } catch (error) {
      console.error('[VerseAnnotationStore] Failed to add note:', error);
      // Revert optimistic update
      const revertSet = new Set(get().notedVerseKeys);
      revertSet.delete(verseKey);
      set({
        notedVerseKeys: revertSet,
        error: error instanceof Error ? error.message : 'Failed to add note'
      });
      throw error;
    }
  },

  updateNote: async (noteId: string, content: string) => {
    try {
      set({ error: null });
      await verseAnnotationService.updateNote(noteId, content);
    } catch (error) {
      console.error('[VerseAnnotationStore] Failed to update note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
      set({ error: errorMessage });
      throw error;
    }
  },

  removeNote: async (verseKey: string, noteId: string) => {
    // Optimistic update
    const newSet = new Set(get().notedVerseKeys);
    newSet.delete(verseKey);
    set({ notedVerseKeys: newSet, error: null });

    try {
      await verseAnnotationService.removeNote(noteId);
    } catch (error) {
      console.error('[VerseAnnotationStore] Failed to remove note:', error);
      // Revert optimistic update
      const revertSet = new Set(get().notedVerseKeys);
      revertSet.add(verseKey);
      set({
        notedVerseKeys: revertSet,
        error: error instanceof Error ? error.message : 'Failed to remove note'
      });
      throw error;
    }
  },

  setNoteExists: (verseKey: string, exists: boolean) => {
    const newSet = new Set(get().notedVerseKeys);
    if (exists) {
      newSet.add(verseKey);
    } else {
      newSet.delete(verseKey);
    }
    set({ notedVerseKeys: newSet });
  },

  // Highlight actions
  setHighlight: async (verseKey: string, surahNumber: number, ayahNumber: number, color: HighlightColor) => {
    // Optimistic update
    set({
      highlights: { ...get().highlights, [verseKey]: color },
      error: null
    });

    try {
      // Remove existing highlight first if it exists
      await verseAnnotationService.removeHighlight(verseKey);
      // Add new highlight
      await verseAnnotationService.addHighlight(verseKey, surahNumber, ayahNumber, color);
    } catch (error) {
      console.error('[VerseAnnotationStore] Failed to set highlight:', error);
      // Revert optimistic update
      const newHighlights = { ...get().highlights };
      delete newHighlights[verseKey];
      set({
        highlights: newHighlights,
        error: error instanceof Error ? error.message : 'Failed to set highlight'
      });
      throw error;
    }
  },

  removeHighlight: async (verseKey: string) => {
    // Optimistic update
    const newHighlights = { ...get().highlights };
    const previousColor = newHighlights[verseKey];
    delete newHighlights[verseKey];
    set({ highlights: newHighlights, error: null });

    try {
      await verseAnnotationService.removeHighlight(verseKey);
    } catch (error) {
      console.error('[VerseAnnotationStore] Failed to remove highlight:', error);
      // Revert optimistic update
      if (previousColor) {
        set({
          highlights: { ...get().highlights, [verseKey]: previousColor },
          error: error instanceof Error ? error.message : 'Failed to remove highlight'
        });
      }
      throw error;
    }
  },

  // Query helpers (O(1))
  isBookmarked: (verseKey: string) => get().bookmarkedVerseKeys.has(verseKey),

  hasNote: (verseKey: string) => get().notedVerseKeys.has(verseKey),

  getHighlightColor: (verseKey: string) => get().highlights[verseKey] ?? null,

  // Utility
  clearError: () => set({ error: null }),

  resetAnnotationsForSurah: () => set({
    loadedSurah: null,
    bookmarkedVerseKeys: new Set<string>(),
    notedVerseKeys: new Set<string>(),
    highlights: {},
    loading: false,
    error: null,
  }),
}));