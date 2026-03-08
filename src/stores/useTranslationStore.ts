import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontSize, TranslationPosition } from '@/types/translation';

interface TranslationStore {
  // State
  selectedTranslation: string | null;
  showTranslations: boolean;
  translationPosition: TranslationPosition;
  fontSize: FontSize;

  // Actions
  setSelectedTranslation: (id: string) => void;
  toggleTranslations: () => void;
  setTranslationPosition: (position: TranslationPosition) => void;
  setFontSize: (size: FontSize) => void;
}

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set) => ({
      // Initial state
      selectedTranslation: 'saheeh', // Default to Saheeh International
      showTranslations: false,
      translationPosition: 'below',
      fontSize: 'medium',

      // Actions
      setSelectedTranslation: (id) => set({ selectedTranslation: id }),
      toggleTranslations: () => set((state) => ({ showTranslations: !state.showTranslations })),
      setTranslationPosition: (position) => set({ translationPosition: position }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    {
      name: 'bayaan-translation-settings',
    }
  )
);