import { create } from "zustand";
import type { QcfWord } from "@/types/quran-api";
import { buildWordAudioUrl } from "@/lib/word-audio";
import { audioCoordinator } from "@/services/audio/audio-coordinator";

interface WordAudioState {
  activeLocation: string | null;
  play: (word: QcfWord) => Promise<void>;
  stop: () => void;
}

let audioElement: HTMLAudioElement | null = null;

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = "auto";
    audioElement.addEventListener("ended", () => {
      useWordAudioStore.setState({ activeLocation: null });
      audioCoordinator.sourceDidStop("mushaf");
    });
    audioElement.addEventListener("error", () => {
      useWordAudioStore.setState({ activeLocation: null });
      audioCoordinator.sourceDidStop("mushaf");
    });
  }
  return audioElement;
}

export const useWordAudioStore = create<WordAudioState>((set, get) => ({
  activeLocation: null,

  play: async (word) => {
    if (word.char_type_name !== "word" || !word.audio_url) return;

    const audio = getAudioElement();
    if (!audio) return;

    audioCoordinator.mushafWillPlay();

    const url = buildWordAudioUrl(word.audio_url);
    const isSameWord = get().activeLocation === word.location;

    if (isSameWord && !audio.paused) {
      audio.currentTime = 0;
      await audio.play();
      return;
    }

    audio.src = url;
    set({ activeLocation: word.location });

    try {
      await audio.play();
    } catch {
      set({ activeLocation: null });
      audioCoordinator.sourceDidStop("mushaf");
    }
  },

  stop: () => {
    const audio = getAudioElement();
    audio?.pause();
    set({ activeLocation: null });
    audioCoordinator.sourceDidStop("mushaf");
  },
}));

audioCoordinator.registerPauseHandler("mushaf", () => {
  useWordAudioStore.getState().stop();
});
