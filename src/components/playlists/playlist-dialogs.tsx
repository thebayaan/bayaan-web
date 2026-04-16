"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PlaylistForm } from "./playlist-form";
import { usePlaylists, type Playlist } from "@/hooks/use-playlists";

export function CreatePlaylistDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createPlaylist } = usePlaylists();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <DialogTitle>New playlist</DialogTitle>
        <DialogDescription className="mb-4">
          Give it a name so you can find it later.
        </DialogDescription>
        <PlaylistForm
          submitLabel="Create"
          onCancel={() => onOpenChange(false)}
          onSubmit={async (values) => {
            await createPlaylist(values);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function RenamePlaylistDialog({
  playlist,
  open,
  onOpenChange,
}: {
  playlist: Playlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updatePlaylist } = usePlaylists();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <DialogTitle>Rename playlist</DialogTitle>
        <DialogDescription className="mb-4">
          Update the name or description for this playlist.
        </DialogDescription>
        <PlaylistForm
          submitLabel="Save"
          initialValues={{ name: playlist.name, description: playlist.description ?? "" }}
          onCancel={() => onOpenChange(false)}
          onSubmit={async (values) => {
            await updatePlaylist(playlist.id, values);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function DeletePlaylistDialog({
  playlist,
  open,
  onOpenChange,
  onDeleted,
}: {
  playlist: Playlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const { deletePlaylist } = usePlaylists();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <DialogTitle>Delete &ldquo;{playlist.name}&rdquo;?</DialogTitle>
        <DialogDescription className="mb-4">
          This removes the playlist and all of its tracks. You can&apos;t undo this.
        </DialogDescription>
        {error ? (
          <p role="alert" className="text-destructive mb-3 text-sm">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)]"
          >
            Cancel
          </button>
          <button
            disabled={pending}
            onClick={async () => {
              setError(null);
              setPending(true);
              try {
                await deletePlaylist(playlist.id);
                onOpenChange(false);
                onDeleted?.();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Couldn't delete playlist");
              } finally {
                setPending(false);
              }
            }}
            className="bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
