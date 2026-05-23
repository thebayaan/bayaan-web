"use client";

import { useEffect, useRef, useState } from "react";
import { AddToPlaylistDialog } from "@/components/playlists/add-to-playlist";
import { recitationShareUrl } from "@/lib/share-urls";
import { useMenuKeyboardNav } from "@/hooks/use-menu-keyboard-nav";
import type { Track } from "@/types/audio";

interface NowPlayingMenuProps {
  track: Track;
  reciterSlug?: string;
  className?: string;
}

type Toast = "copied" | null;

export function NowPlayingMenu({ track, reciterSlug, className }: NowPlayingMenuProps) {
  const [open, setOpen] = useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleMenuKey = useMenuKeyboardNav();

  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(null), 1500);
    return () => window.clearTimeout(id);
  }, [toast]);

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

  // ARIA APG: opening a menu focuses the first item so ArrowUp/Down have
  // a starting point.
  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])');
    first?.focus();
  }, [open]);

  async function handleShare(): Promise<void> {
    setOpen(false);
    if (!reciterSlug) return;
    const url = recitationShareUrl(reciterSlug, track.surahId);
    const shareData = { title: track.title, text: `${track.title} by ${track.artist}`, url };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or API missing — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("copied");
    } catch {
      // Ignore.
    }
  }

  function openPlaylistDialog(): void {
    setOpen(false);
    setPlaylistDialogOpen(true);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${track.title}`}
        onClick={() => setOpen((v) => !v)}
        className={
          className ??
          "text-muted-foreground hover:text-foreground duration-fast ease-standard rounded-full p-1.5 transition-colors hover:bg-[var(--text-alpha-10)]"
        }
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>
      {open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            role="menu"
            aria-label={`More actions for ${track.title}`}
            onKeyDown={handleMenuKey}
            className="border-border bg-background absolute right-0 bottom-full z-20 mb-2 w-56 rounded-lg border p-1 shadow-xl"
          >
            <button
              role="menuitem"
              type="button"
              onClick={openPlaylistDialog}
              className="hover:bg-surface-raised flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 7h12v2H4V7zm0 4h12v2H4v-2zm0 4h8v2H4v-2zm14-4v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2z" />
              </svg>
              <span>Add to playlist</span>
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => void handleShare()}
              disabled={!reciterSlug}
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
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </>
      ) : null}
      <AddToPlaylistDialog
        item={{
          reciter_id: track.reciterId,
          rewayat_id: track.rewayatId,
          surah_id: track.surahId,
        }}
        open={playlistDialogOpen}
        onOpenChange={setPlaylistDialogOpen}
      />
      {toast === "copied" ? (
        <span role="status" aria-live="polite" className="sr-only">
          Share link copied to clipboard
        </span>
      ) : null}
    </div>
  );
}
