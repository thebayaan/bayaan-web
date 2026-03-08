'use client';

import Link from 'next/link';
import { UserPlaylist } from '@/types/playlist';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface PlaylistCardProps {
  playlist: UserPlaylist;
  onEdit?: (playlist: UserPlaylist) => void;
  onDelete?: (playlist: UserPlaylist) => void;
}

// Playlist color classes mapping
const PLAYLIST_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
};

export function PlaylistCard({ playlist, onEdit, onDelete }: PlaylistCardProps) {
  const colorClass = PLAYLIST_COLOR_CLASSES[playlist.color] || 'bg-blue-500';

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(playlist);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(playlist);
  };

  return (
    <Link href={`/collection/playlist/${playlist.id}`} className="block">
      <Card className="p-4 hover:bg-hover transition-colors group relative">
        {/* Color indicator */}
        <div className={cn('w-3 h-3 rounded-full mb-3', colorClass)} />

        {/* Playlist info */}
        <div className="mb-3">
          <h3 className="font-medium text-text mb-1 line-clamp-2">
            {playlist.name}
          </h3>
          {playlist.description && (
            <p className="text-secondary text-sm line-clamp-2 mb-2">
              {playlist.description}
            </p>
          )}
          <p className="text-hint text-xs">
            {playlist.itemCount} {playlist.itemCount === 1 ? 'recitation' : 'recitations'}
          </p>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 flex gap-1">
          {onEdit && (
            <IconButton
              size="sm"
              onClick={handleEdit}
              className="w-6 h-6"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              size="sm"
              onClick={handleDelete}
              className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </IconButton>
          )}
        </div>

        {/* Creation date */}
        <div className="text-hint text-xs mt-2 border-t border-divider pt-2">
          Created {new Date(playlist.createdAt).toLocaleDateString()}
        </div>
      </Card>
    </Link>
  );
}