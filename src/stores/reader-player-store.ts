import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Preferences for the inline recitation player on /quran/[surah].
 * Persists the user's last-used reciter + rewayat so it's pre-selected
 * on subsequent visits without re-prompting.
 */
export interface ReaderPlayerState {
  lastReciterId: string | null;
  lastRewayatId: string | null;
  setLastReciter: (reciterId: string, rewayatId: string) => void;
  clear: () => void;
}

export const useReaderPlayerStore = create<ReaderPlayerState>()(
  persist(
    (set) => ({
      lastReciterId: null,
      lastRewayatId: null,
      setLastReciter: (reciterId, rewayatId) =>
        set({ lastReciterId: reciterId, lastRewayatId: rewayatId }),
      clear: () => set({ lastReciterId: null, lastRewayatId: null }),
    }),
    {
      name: "bayaan-reader-player",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
