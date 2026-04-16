"use client";

import { usePlaylists } from "@/hooks/use-playlists";
import Link from "next/link";
import { PlayIcon } from "@/components/icons";

export default function PlaylistsPage() {
  const { playlists, isLoading } = usePlaylists();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Playlists</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-12 text-center">
          <PlayIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No playlists yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a playlist to organize your favorite recitations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/collection/playlists/${playlist.id}`}
              className="rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              <p className="font-semibold">{playlist.name}</p>
              {playlist.description && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {playlist.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
