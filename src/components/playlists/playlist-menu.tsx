"use client";

import { useEffect, useRef, useState } from "react";
import type { Playlist } from "@/hooks/use-playlists";
import { useMenuKeyboardNav } from "@/hooks/use-menu-keyboard-nav";
import { RenamePlaylistDialog, DeletePlaylistDialog } from "./playlist-dialogs";

export function PlaylistCardMenu({ playlist }: { playlist: Playlist }) {
  const [open, setOpen] = useState<"menu" | "rename" | "delete" | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleMenuKey = useMenuKeyboardNav();
  const menuOpen = open === "menu";

  // Close on Escape and return focus to the trigger.
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        setOpen(null);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // ARIA APG: move focus to the first menuitem when the menu opens so
  // arrow-key traversal has a starting point.
  useEffect(() => {
    if (!menuOpen) return;
    const first = menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])');
    first?.focus();
  }, [menuOpen]);

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          aria-label={`Actions for ${playlist.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(menuOpen ? null : "menu");
          }}
          className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground rounded-full p-1.5 transition-colors"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
        {menuOpen ? (
          <>
            <div
              aria-hidden="true"
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(null);
              }}
            />
            <div
              ref={menuRef}
              role="menu"
              aria-label={`Actions for ${playlist.name}`}
              onKeyDown={handleMenuKey}
              className="border-border bg-background absolute right-0 z-20 mt-1 w-40 rounded-lg border p-1 shadow-lg"
            >
              <button
                role="menuitem"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen("rename");
                }}
                className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors"
              >
                Rename
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen("delete");
                }}
                className="hover:bg-destructive/10 text-destructive w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        ) : null}
      </div>
      <RenamePlaylistDialog
        playlist={playlist}
        open={open === "rename"}
        onOpenChange={(next) => setOpen(next ? "rename" : null)}
      />
      <DeletePlaylistDialog
        playlist={playlist}
        open={open === "delete"}
        onOpenChange={(next) => setOpen(next ? "delete" : null)}
      />
    </>
  );
}
