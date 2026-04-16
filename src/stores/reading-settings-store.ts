import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ReadingSettingsState {
  fontSize: number;
  lightThemeId: string;
  darkThemeId: string;
  translationIds: string;
  showTransliteration: boolean;
  showWordByWord: boolean;
  showTajweed: boolean;
  mushafPage: number;
  setFontSize: (size: number) => void;
  setLightTheme: (id: string) => void;
  setDarkTheme: (id: string) => void;
  setTranslationIds: (ids: string) => void;
  toggleTransliteration: () => void;
  toggleWordByWord: () => void;
  toggleTajweed: () => void;
  setMushafPage: (page: number) => void;
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
      setFontSize: (size) => set({ fontSize: size }),
      setLightTheme: (id) => set({ lightThemeId: id }),
      setDarkTheme: (id) => set({ darkThemeId: id }),
      setTranslationIds: (ids) => set({ translationIds: ids }),
      toggleTransliteration: () => set((s) => ({ showTransliteration: !s.showTransliteration })),
      toggleWordByWord: () => set((s) => ({ showWordByWord: !s.showWordByWord })),
      toggleTajweed: () => set((s) => ({ showTajweed: !s.showTajweed })),
      setMushafPage: (page) => set({ mushafPage: page }),
    }),
    {
      name: "bayaan-reading-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
