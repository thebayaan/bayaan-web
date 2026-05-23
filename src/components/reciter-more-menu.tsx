"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { reciterShareUrl } from "@/lib/share-urls";
import { createQueueFromSurah } from "@/lib/audio-utils";
import type { Reciter, Rewayat } from "@/types/reciter";

interface ReciterMoreMenuProps {
  reciter: Reciter;
  rewayat: Rewayat | undefined;
  surahNameMap: Record<number, string>;
  className?: string;
}

type Toast = "queued" | "copied" | null;

export function ReciterMoreMenu({
  reciter,
  rewayat,
  surahNameMap,
  className,
}: ReciterMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  // Hide the toast after a short window so it doesn't linger.
  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(null), 1500);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Close on Escape; trap basic focus by returning focus to the trigger.
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleCopyLink(): Promise<void> {
    setOpen(false);
    const url = reciterShareUrl(reciter.slug);
    try {
      await navigator.clipboard.writeText(url);
      setToast("copied");
    } catch {
      // Clipboard blocked (e.g., non-HTTPS iframe). Fall through silently.
    }
  }

  function handleAddAllToQueue(): void {
    setOpen(false);
    if (!rewayat) return;
    const firstSurah = rewayat.surah_list[0];
    if (firstSurah === undefined) return;
    // createQueueFromSurah returns the full rewayat list, reordered from
    // the given surah onward — passing the first surah gives natural order.
    const { tracks } = createQueueFromSurah(reciter, rewayat, firstSurah, surahNameMap);
    if (tracks.length === 0) return;
    void addToQueue(tracks);
    setToast("queued");
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={className}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>
      {open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="menu"
            aria-label={`More actions for ${reciter.name}`}
            className="border-border bg-background absolute right-0 z-20 mt-2 w-56 rounded-lg border p-1 shadow-xl"
          >
            <button
              role="menuitem"
              type="button"
              onClick={handleAddAllToQueue}
              disabled={!rewayat || rewayat.surah_list.length === 0}
              className="hover:bg-surface-raised flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors disabled:opacity-50"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Add all to queue</span>
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => void handleCopyLink()}
              className="hover:bg-surface-raised flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Copy link</span>
            </button>
          </div>
        </>
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {toast === "copied"
          ? "Link copied to clipboard"
          : toast === "queued"
            ? `Added all surahs by ${reciter.name} to the queue`
            : ""}
      </span>
      {toast ? (
        <div
          aria-hidden="true"
          className="bg-foreground text-background pointer-events-none absolute right-0 -bottom-10 z-30 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-lg"
        >
          {toast === "copied" ? "Link copied" : "Added to queue"}
        </div>
      ) : null}
    </div>
  );
}
