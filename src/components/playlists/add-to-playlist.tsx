"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePlaylists } from "@/hooks/use-playlists";
import { addPlaylistItem, type AddPlaylistItemInput } from "@/hooks/use-playlist";
import { PlaylistForm } from "./playlist-form";

interface AddToPlaylistButtonProps {
  /** Visible label for screen readers; also shown on focus/hover. */
  label: string;
  item: AddPlaylistItemInput;
  className?: string;
}

export function AddToPlaylistButton({ label, item, className }: AddToPlaylistButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={label}
        className={className}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 7h12v2H4V7zm0 4h12v2H4v-2zm0 4h8v2H4v-2zm14-4v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2z" />
        </svg>
      </button>
      <AddToPlaylistDialog item={item} open={open} onOpenChange={setOpen} />
    </>
  );
}

interface AddToPlaylistDialogProps {
  item: AddPlaylistItemInput;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToPlaylistDialog({ item, open, onOpenChange }: AddToPlaylistDialogProps) {
  const { playlists, createPlaylist, isLoading } = usePlaylists();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(id: string): Promise<void> {
    setError(null);
    setBusyId(id);
    try {
      await addPlaylistItem(id, item);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add to playlist");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogTitle>Add to playlist</DialogTitle>
        <DialogDescription className="mb-3">
          Pick one of your playlists, or create a new one.
        </DialogDescription>

        {creating ? (
          <PlaylistForm
            submitLabel="Create and add"
            onCancel={() => setCreating(false)}
            onSubmit={async (values) => {
              const created = await createPlaylist(values);
              await addPlaylistItem(created.id, item);
              onOpenChange(false);
              setCreating(false);
            }}
          />
        ) : (
          <>
            {error ? (
              <p role="alert" className="text-destructive mb-2 text-sm">
                {error}
              </p>
            ) : null}
            <ul className="max-h-72 space-y-1 overflow-y-auto" aria-label="Your playlists">
              {isLoading ? (
                <li className="text-muted-foreground px-2 py-2 text-sm">Loading…</li>
              ) : playlists.length === 0 ? (
                <li className="text-muted-foreground px-2 py-2 text-sm">
                  No playlists yet — create one below.
                </li>
              ) : (
                playlists.map((playlist) => (
                  <li key={playlist.id}>
                    <button
                      disabled={busyId === playlist.id}
                      onClick={() => void handleSelect(playlist.id)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--text-alpha-06)] disabled:opacity-50"
                    >
                      <span className="truncate">{playlist.name}</span>
                      {busyId === playlist.id ? (
                        <span className="text-muted-foreground text-xs">Adding…</span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)]"
              >
                Cancel
              </button>
              <button
                onClick={() => setCreating(true)}
                className="bg-foreground text-background rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                New playlist
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
