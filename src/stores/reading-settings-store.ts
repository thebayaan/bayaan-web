import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ReadingSettingsState {
  fontSize: number;
  lightThemeId: string;
  darkThemeId: string;
  translationIds: string;
  showTransliteration: boolean;
  showWordByWord: boolean;
  showTajweed: boolean;
  mushafPage: number;
  /**
   * Last surah the user opened in the reading view, plus the ISO
   * timestamp of when. Powers the "Continue reading" card on /home.
   * Null until the user has opened at least one surah.
   */
  lastReadSurahId: number | null;
  lastReadSurahAt: string | null;
  setFontSize: (size: number) => void;
  setLightTheme: (id: string) => void;
  setDarkTheme: (id: string) => void;
  setTranslationIds: (ids: string) => void;
  toggleTransliteration: () => void;
  toggleWordByWord: () => void;
  toggleTajweed: () => void;
  setMushafPage: (page: number) => void;
  markSurahRead: (surahId: number) => void;
}

export const useReadingSettingsStore = create<ReadingSettingsState>()(
  persist(
    (set) => ({
      fontSize: 1.8,
      lightThemeId: "default",
      darkThemeId: "dark-default",
      translationIds: "131",
      showTransliteration: false,
      showWordByWord: false,
      showTajweed: false,
      mushafPage: 1,
      lastReadSurahId: null,
      lastReadSurahAt: null,
      setFontSize: (size) => set({ fontSize: size }),
      setLightTheme: (id) => set({ lightThemeId: id }),
      setDarkTheme: (id) => set({ darkThemeId: id }),
      setTranslationIds: (ids) => set({ translationIds: ids }),
      toggleTransliteration: () => set((s) => ({ showTransliteration: !s.showTransliteration })),
      toggleWordByWord: () => set((s) => ({ showWordByWord: !s.showWordByWord })),
      toggleTajweed: () => set((s) => ({ showTajweed: !s.showTajweed })),
      setMushafPage: (page) => set({ mushafPage: page }),
      markSurahRead: (surahId) =>
        set({ lastReadSurahId: surahId, lastReadSurahAt: new Date().toISOString() }),
    }),
    {
      name: "bayaan-reading-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
