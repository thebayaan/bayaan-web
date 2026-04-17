"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlaylists } from "@/hooks/use-playlists";
import { PlayIcon } from "@/components/icons";
import { CreatePlaylistDialog } from "@/components/playlists/playlist-dialogs";
import { PlaylistCardMenu } from "@/components/playlists/playlist-menu";

export default function PlaylistsPage() {
  const { playlists, isLoading } = usePlaylists();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-foreground text-background rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          New playlist
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-sunken h-16 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-12 text-center">
          <PlayIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No playlists yet</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-foreground mt-2 text-sm underline underline-offset-4"
          >
            Create your first
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              className="group bg-surface-raised hover:bg-accent relative rounded-xl transition-colors"
            >
              <Link href={`/collection/playlists/${playlist.id}`} className="block p-4 pr-12">
                <p className="truncate font-semibold">{playlist.name}</p>
                {playlist.description ? (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {playlist.description}
                  </p>
                ) : null}
              </Link>
              <div className="absolute top-3 right-3">
                <PlaylistCardMenu playlist={playlist} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreatePlaylistDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
