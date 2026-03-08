'use client';

import { useState } from 'react';
import { UserPlaylist } from '@/types/playlist';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface PlaylistFormProps {
  playlist?: UserPlaylist; // For editing existing playlist
  onSave: (data: { name: string; color: string; description?: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PLAYLIST_COLORS = [
  { name: 'Blue', value: 'blue', className: 'bg-blue-500' },
  { name: 'Green', value: 'green', className: 'bg-green-500' },
  { name: 'Purple', value: 'purple', className: 'bg-purple-500' },
  { name: 'Orange', value: 'orange', className: 'bg-orange-500' },
  { name: 'Red', value: 'red', className: 'bg-red-500' },
  { name: 'Pink', value: 'pink', className: 'bg-pink-500' },
  { name: 'Indigo', value: 'indigo', className: 'bg-indigo-500' },
  { name: 'Teal', value: 'teal', className: 'bg-teal-500' },
];

export function PlaylistForm({ playlist, onSave, onCancel, loading }: PlaylistFormProps) {
  const [name, setName] = useState(playlist?.name || '');
  const [description, setDescription] = useState(playlist?.description || '');
  const [selectedColor, setSelectedColor] = useState(playlist?.color || 'blue');

  const isEditing = !!playlist;
  const canSave = name.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || loading) return;

    try {
      await onSave({
        name: name.trim(),
        color: selectedColor,
        description: description.trim() || undefined,
      });
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-text mb-6">
        {isEditing ? 'Edit Playlist' : 'Create Playlist'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-label mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter playlist name"
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-text placeholder-hint focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            maxLength={100}
            disabled={loading}
          />
          <p className="text-xs text-hint mt-1">
            {name.length}/100 characters
          </p>
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-label mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter playlist description (optional)"
            rows={3}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-text placeholder-hint focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
            maxLength={500}
            disabled={loading}
          />
          <p className="text-xs text-hint mt-1">
            {description.length}/500 characters
          </p>
        </div>

        {/* Color selection */}
        <div>
          <label className="block text-sm font-medium text-label mb-3">
            Color
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {PLAYLIST_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                disabled={loading}
                className={cn(
                  'w-10 h-10 rounded-full border-2 transition-all',
                  color.className,
                  selectedColor === color.value
                    ? 'border-accent ring-2 ring-accent/20 scale-110'
                    : 'border-card-border hover:border-accent hover:scale-105',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSave || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                {isEditing ? 'Update' : 'Create'} Playlist
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}