'use client';

import { UserPlaylist } from '@/types/playlist';
import { PlaylistCard } from './PlaylistCard';

interface PlaylistGridProps {
  playlists: UserPlaylist[];
  loading?: boolean;
  onEdit?: (playlist: UserPlaylist) => void;
  onDelete?: (playlist: UserPlaylist) => void;
  emptyMessage?: string;
}

export function PlaylistGrid({
  playlists,
  loading,
  onEdit,
  onDelete,
  emptyMessage = "No playlists yet"
}: PlaylistGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-36 bg-card border border-card-border rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 mb-4 rounded-full bg-card flex items-center justify-center">
          <svg className="w-8 h-8 text-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text mb-2">
          {emptyMessage}
        </h3>
        <p className="text-secondary text-center max-w-sm">
          Create your first playlist to organize your favorite Quran recitations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}