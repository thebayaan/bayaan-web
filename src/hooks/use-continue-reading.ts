"use client";

import { useSyncExternalStore } from "react";

export const CONTINUE_READING_KEY = "bayaan-continue-reading";

export interface ContinueReadingEntry {
  surahId: number;
  surahName: string;
  verseId: number;
  page: number;
}

let cachedRaw: string | null = null;
let cachedEntry: ContinueReadingEntry | null = null;

function readEntry(): ContinueReadingEntry | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CONTINUE_READING_KEY);
  if (raw === cachedRaw) return cachedEntry;
  cachedRaw = raw;
  if (!raw) {
    cachedEntry = null;
    return cachedEntry;
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.surahId === "number" &&
      typeof parsed?.surahName === "string" &&
      typeof parsed?.verseId === "number" &&
      typeof parsed?.page === "number"
    ) {
      cachedEntry = parsed as ContinueReadingEntry;
      return cachedEntry;
    }
    cachedEntry = null;
    return cachedEntry;
  } catch {
    cachedEntry = null;
    return cachedEntry;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("bayaan:continue-reading-change", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("bayaan:continue-reading-change", cb);
  };
}

export function useContinueReading(): ContinueReadingEntry | null {
  return useSyncExternalStore(
    subscribe,
    () => readEntry(),
    () => null,
  );
}

export function setContinueReading(entry: ContinueReadingEntry) {
  localStorage.setItem(CONTINUE_READING_KEY, JSON.stringify(entry));
  window.dispatchEvent(new Event("bayaan:continue-reading-change"));
}
