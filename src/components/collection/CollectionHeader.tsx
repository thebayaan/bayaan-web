'use client';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface CollectionHeaderProps {
  onCreatePlaylist: () => void;
  playlistCount: number;
  loading?: boolean;
}

export function CollectionHeader({ onCreatePlaylist, playlistCount, loading }: CollectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <SectionHeader>Collection</SectionHeader>
        <p className="text-secondary text-sm mt-1">
          {loading ? (
            <span className="animate-pulse">Loading playlists...</span>
          ) : (
            <>
              {playlistCount === 0
                ? 'No playlists yet'
                : `${playlistCount} ${playlistCount === 1 ? 'playlist' : 'playlists'}`
              }
            </>
          )}
        </p>
      </div>

      <Button onClick={onCreatePlaylist} disabled={loading}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Playlist
      </Button>
    </div>
  );
}