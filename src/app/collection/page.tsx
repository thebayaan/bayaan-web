'use client';

import { useState, useEffect } from 'react';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { initializeCollectionDB } from '@/lib/collectionService';
import { UserPlaylist } from '@/types/playlist';
import { CollectionHeader } from '@/components/collection/CollectionHeader';
import { PlaylistGrid } from '@/components/collection/PlaylistGrid';
import { PlaylistForm } from '@/components/collection/PlaylistForm';
import { DeletePlaylistDialog } from '@/components/collection/DeletePlaylistDialog';

interface DialogState {
  type: 'create' | 'edit' | 'delete' | null;
  playlist?: UserPlaylist;
}

export default function CollectionPage() {
  const {
    playlists,
    loading,
    error,
    loadPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    clearError
  } = usePlaylistStore();

  const [dialog, setDialog] = useState<DialogState>({ type: null });
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize database and load playlists
  useEffect(() => {
    const init = async () => {
      try {
        await initializeCollectionDB();
        setDbInitialized(true);
        await loadPlaylists();
      } catch (err) {
        console.error('Failed to initialize collection database:', err);
      }
    };

    init();
  }, [loadPlaylists]);

  // Clear errors when dialog changes
  useEffect(() => {
    if (dialog.type === null) {
      clearError();
    }
  }, [dialog.type, clearError]);

  const handleCreatePlaylist = () => {
    setDialog({ type: 'create' });
  };

  const handleEditPlaylist = (playlist: UserPlaylist) => {
    setDialog({ type: 'edit', playlist });
  };

  const handleDeletePlaylist = (playlist: UserPlaylist) => {
    setDialog({ type: 'delete', playlist });
  };

  const handleCloseDialog = () => {
    setDialog({ type: null });
  };

  const handleSavePlaylist = async (data: { name: string; color: string; description?: string }) => {
    if (dialog.type === 'create') {
      await createPlaylist(data.name, data.color, data.description);
    } else if (dialog.type === 'edit' && dialog.playlist) {
      await updatePlaylist(dialog.playlist.id, data);
    }
    handleCloseDialog();
  };

  const handleConfirmDelete = async () => {
    if (dialog.playlist) {
      await deletePlaylist(dialog.playlist.id);
      handleCloseDialog();
    }
  };

  if (!dbInitialized) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary">Initializing collection...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <CollectionHeader
        onCreatePlaylist={handleCreatePlaylist}
        playlistCount={playlists.length}
        loading={loading}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <PlaylistGrid
        playlists={playlists}
        loading={loading}
        onEdit={handleEditPlaylist}
        onDelete={handleDeletePlaylist}
      />

      {/* Dialogs */}
      {dialog.type === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <PlaylistForm
              onSave={handleSavePlaylist}
              onCancel={handleCloseDialog}
            />
          </div>
        </div>
      )}

      {dialog.type === 'edit' && dialog.playlist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <PlaylistForm
              playlist={dialog.playlist}
              onSave={handleSavePlaylist}
              onCancel={handleCloseDialog}
            />
          </div>
        </div>
      )}

      {dialog.type === 'delete' && dialog.playlist && (
        <DeletePlaylistDialog
          playlist={dialog.playlist}
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDialog}
        />
      )}
    </main>
  );
}
