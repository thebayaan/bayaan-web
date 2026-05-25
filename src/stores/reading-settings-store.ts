import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ReaderViewMode = "reading" | "mushaf";

export interface ReadingSettingsState {
  fontSize: number;
  lightThemeId: string;
  darkThemeId: string;
  translationIds: string;
  /** Quran.com v4 tafsir resource id (default Ibn Kathir abridged). */
  tafsirId: string;
  showTransliteration: boolean;
  showWordByWord: boolean;
  showTajweed: boolean;
  mushafPage: number;
  /** Bumped on explicit mushaf jumps so MushafView remounts even on the same surah route. */
  mushafJumpSeq: number;
  viewMode: ReaderViewMode;
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
  setTafsirId: (id: string) => void;
  toggleTransliteration: () => void;
  toggleWordByWord: () => void;
  toggleTajweed: () => void;
  setMushafPage: (page: number) => void;
  jumpToMushafPage: (page: number) => void;
  setViewMode: (mode: ReaderViewMode) => void;
  markSurahRead: (surahId: number) => void;
}

export const useReadingSettingsStore = create<ReadingSettingsState>()(
  persist(
    (set) => ({
      fontSize: 1.8,
      lightThemeId: "default",
      darkThemeId: "dark-default",
      translationIds: "131",
      tafsirId: "169",
      showTransliteration: false,
      showWordByWord: false,
      showTajweed: false,
      mushafPage: 1,
      mushafJumpSeq: 0,
      viewMode: "reading",
      lastReadSurahId: null,
      lastReadSurahAt: null,
      setFontSize: (size) => set({ fontSize: size }),
      setLightTheme: (id) => set({ lightThemeId: id }),
      setDarkTheme: (id) => set({ darkThemeId: id }),
      setTranslationIds: (ids) => set({ translationIds: ids }),
      setTafsirId: (id) => set({ tafsirId: id }),
      toggleTransliteration: () => set((s) => ({ showTransliteration: !s.showTransliteration })),
      toggleWordByWord: () => set((s) => ({ showWordByWord: !s.showWordByWord })),
      toggleTajweed: () => set((s) => ({ showTajweed: !s.showTajweed })),
      setMushafPage: (page) => set({ mushafPage: page }),
      jumpToMushafPage: (page) =>
        set((s) => ({
          mushafPage: page,
          viewMode: "mushaf",
          mushafJumpSeq: s.mushafJumpSeq + 1,
        })),
      setViewMode: (mode) => set({ viewMode: mode }),
      markSurahRead: (surahId) =>
        set({ lastReadSurahId: surahId, lastReadSurahAt: new Date().toISOString() }),
    }),
    {
      name: "bayaan-reading-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
