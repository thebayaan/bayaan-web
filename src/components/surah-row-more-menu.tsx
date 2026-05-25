"use client";

import { useEffect, useRef, useState } from "react";
import type { Reciter, Rewayat } from "@/types/reciter";
import type { Surah } from "@/types/quran";
import { usePlayerStore } from "@/stores/player-store";
import { useMenuKeyboardNav } from "@/hooks/use-menu-keyboard-nav";
import { createTrack } from "@/lib/audio-utils";
import { recitationShareUrl } from "@/lib/share-urls";
import { AddToPlaylistDialog } from "@/components/playlists/add-to-playlist";
import { QueueIcon, ShareIcon } from "@/components/icons";

interface SurahRowMoreMenuProps {
  reciter: Reciter;
  rewayat: Rewayat;
  surah: Surah;
  className?: string;
}

type Toast = "queued" | "shared" | "copied" | "failed" | null;

export function SurahRowMoreMenu({ reciter, rewayat, surah, className }: SurahRowMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleMenuKey = useMenuKeyboardNav();
  const addToQueue = usePlayerStore((s) => s.addToQueue);

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

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])');
    first?.focus();
  }, [open]);

  function handleAddToQueue(): void {
    setOpen(false);
    const track = createTrack(reciter, rewayat, surah.id, surah.name);
    void addToQueue([track]);
    setToast("queued");
  }

  function handleAddToPlaylist(): void {
    setOpen(false);
    setPlaylistOpen(true);
  }

  async function handleShare(): Promise<void> {
    setOpen(false);
    if (typeof window === "undefined") return;
    const url = recitationShareUrl(reciter.slug, surah.id, { rewayah: rewayat.id });
    const nav = window.navigator;
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: `${surah.name} - ${reciter.name}`, url });
        setToast("shared");
        return;
      } catch (err) {
        // User dismissed the native share sheet — silent no-op, not a "Shared" toast.
        if (err instanceof Error && err.name === "AbortError") return;
        // Fall through to clipboard on any other error.
      }
    }
    if (nav.clipboard) {
      try {
        await nav.clipboard.writeText(url);
        setToast("copied");
        return;
      } catch {
        // intentional fall-through
      }
    }
    setToast("failed");
  }

  function toastMessage(t: Toast): string {
    if (t === "queued") return "Added to queue";
    if (t === "shared") return "Shared";
    if (t === "copied") return "Link copied";
    if (t === "failed") return "Couldn't share";
    return "";
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`More actions for ${surah.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
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
          <div
            aria-hidden="true"
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Actions for ${surah.name}`}
            onKeyDown={handleMenuKey}
            onClick={(e) => e.stopPropagation()}
            className="border-border bg-background absolute right-0 z-20 mt-2 w-56 rounded-lg border p-1 shadow-xl"
          >
            <button
              role="menuitem"
              type="button"
              onClick={handleAddToQueue}
              className="hover:bg-surface-raised flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
            >
              <span className="rotate-180">
                <QueueIcon size={16} color="currentColor" filled aria-hidden="true" />
              </span>
              <span>Add to queue</span>
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={handleAddToPlaylist}
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
              className="hover:bg-surface-raised flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
            >
              <ShareIcon size={16} aria-hidden="true" />
              <span>Share</span>
            </button>
          </div>
        </>
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {toast === "queued"
          ? `Added ${surah.name} to the queue`
          : toast === "shared"
            ? `Shared ${surah.name}`
            : toast === "copied"
              ? "Link copied to clipboard"
              : toast === "failed"
                ? "Sharing failed"
                : ""}
      </span>
      {toast ? (
        <div
          aria-hidden="true"
          className="bg-foreground text-background pointer-events-none absolute right-0 -bottom-10 z-30 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-lg"
        >
          {toastMessage(toast)}
        </div>
      ) : null}
      <AddToPlaylistDialog
        item={{ reciter_id: reciter.id, rewayat_id: rewayat.id, surah_id: surah.id }}
        open={playlistOpen}
        onOpenChange={setPlaylistOpen}
      />
    </div>
  );
}
