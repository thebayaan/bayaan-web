"use client";

import { usePlaylists } from "@/hooks/use-playlists";
import Link from "next/link";
import { PlayIcon } from "@/components/icons";

export default function PlaylistsPage() {
  const { playlists, isLoading } = usePlaylists();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Playlists</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-[var(--text-alpha-06)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <PlayIcon size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No playlists yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a playlist to organize your favorite recitations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/collection/playlists/${playlist.id}`}
              className="p-4 rounded-xl bg-[var(--text-alpha-04)] hover:bg-[var(--text-alpha-06)] transition-colors"
            >
              <p className="font-semibold">{playlist.name}</p>
              {playlist.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
