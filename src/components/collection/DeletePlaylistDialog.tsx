'use client';

import { UserPlaylist } from '@/types/playlist';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DeletePlaylistDialogProps {
  playlist: UserPlaylist;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function DeletePlaylistDialog({
  playlist,
  onConfirm,
  onCancel,
  loading
}: DeletePlaylistDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-text mb-4">
          Delete Playlist
        </h3>

        <p className="text-secondary mb-6">
          Are you sure you want to delete <strong>&quot;{playlist.name}&quot;</strong>?
          This action will permanently remove the playlist and all its recitations.
          This cannot be undone.
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}