import type { AudioService } from "@/lib/audioService";

declare global {
  interface Window {
    audioService?: AudioService;
    playerStore?: object; // For debugging
  }
}

export {};