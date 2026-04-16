"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlaylist } from "@/hooks/use-playlist";
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[var(--text-alpha-06)]" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
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
            className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)]"
          >
            Rename
          </button>
          <button
            onClick={() => setDeleting(true)}
            className="text-destructive rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)]"
          >
            Delete
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground mt-10 rounded-xl bg-[var(--text-alpha-04)] p-8 text-center text-sm">
          No tracks yet. Add tracks to this playlist from a reciter page.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--text-alpha-06)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <span className="text-muted-foreground w-6 text-right text-sm tabular-nums">
                {item.position + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {surahNameMap[item.surah_id] ?? `Surah ${item.surah_id}`}
                </p>
                <p className="text-muted-foreground truncate text-xs">Surah {item.surah_id}</p>
              </div>
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
