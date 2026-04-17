"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlaylist, removePlaylistItem } from "@/hooks/use-playlist";
import {
  RenamePlaylistDialog,
  DeletePlaylistDialog,
} from "@/components/playlists/playlist-dialogs";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];
const surahNameMap = Object.fromEntries(surahs.map((s) => [s.id, s.name])) as Record<
  number,
  string
>;

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { playlist, items, isLoading, error } = usePlaylist(id);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  async function handleRemoveItem(itemId: string): Promise<void> {
    setRemovingItemId(itemId);
    try {
      await removePlaylistItem(id, itemId);
    } finally {
      setRemovingItemId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-surface-sunken h-8 w-56 animate-pulse rounded" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-sunken h-12 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="p-6">
        <Link
          href="/collection/playlists"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          &larr; Playlists
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Playlist not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        href="/collection/playlists"
        className="text-muted-foreground hover:text-foreground inline-flex text-sm transition-colors"
      >
        &larr; Playlists
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{playlist.name}</h1>
          {playlist.description ? (
            <p className="text-muted-foreground mt-1 text-sm">{playlist.description}</p>
          ) : null}
          <p className="text-muted-foreground mt-1 text-xs">
            {items.length} {items.length === 1 ? "track" : "tracks"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRenaming(true)}
            className="bg-surface-sunken hover:bg-accent rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            Rename
          </button>
          <button
            onClick={() => setDeleting(true)}
            className="text-destructive bg-surface-sunken hover:bg-accent rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground bg-surface-raised mt-10 rounded-xl p-8 text-center text-sm">
          No tracks yet. Add tracks to this playlist from a reciter page.
        </div>
      ) : (
        <ul className="divide-border-divider mt-6 divide-y">
          {items.map((item) => (
            <li key={item.id} className="group flex items-center gap-3 py-3">
              <span className="text-muted-foreground w-6 text-right text-sm tabular-nums">
                {item.position + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {surahNameMap[item.surah_id] ?? `Surah ${item.surah_id}`}
                </p>
                <p className="text-muted-foreground truncate text-xs">Surah {item.surah_id}</p>
              </div>
              <button
                onClick={() => void handleRemoveItem(item.id)}
                disabled={removingItemId === item.id}
                aria-label={`Remove ${surahNameMap[item.surah_id] ?? `Surah ${item.surah_id}`} from playlist`}
                className="text-muted-foreground hover:text-destructive hover:bg-accent rounded-full p-2 opacity-0 transition-colors group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
              >
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <RenamePlaylistDialog playlist={playlist} open={renaming} onOpenChange={setRenaming} />
      <DeletePlaylistDialog
        playlist={playlist}
        open={deleting}
        onOpenChange={setDeleting}
        onDeleted={() => router.push("/collection/playlists")}
      />
    </div>
  );
}
