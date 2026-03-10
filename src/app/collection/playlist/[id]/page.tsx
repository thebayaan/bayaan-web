'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Library, Eye, Trash2, BookOpen, Mic, Music, AlertCircle } from 'lucide-react';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { initializeCollectionDB } from '@/lib/collectionService';
import { UserPlaylist, PlaylistItem } from '@/types/playlist';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { NavigationHelper } from '@/components/layout/NavigationHelper';
import { cn } from '@/lib/cn';
import Link from 'next/link';

// Import surah data
import surahData from '@/data/surahData.json';
import recitersData from '@/data/reciters.json';

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

interface PlaylistDetailPageProps {
  params: {
    id: string;
  };
}

export default function PlaylistDetailPage({ params }: PlaylistDetailPageProps) {
  const router = useRouter();
  const { getPlaylist, getPlaylistItems, removeFromPlaylist } = usePlaylistStore();

  const [playlist, setPlaylist] = useState<UserPlaylist | null>(null);
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaylistData = async () => {
      try {
        await initializeCollectionDB();
        const playlistData = await getPlaylist(params.id);

        if (!playlistData) {
          setError('Playlist not found');
          return;
        }

        setPlaylist(playlistData);
        const playlistItems = await getPlaylistItems(params.id);
        setItems(playlistItems);
      } catch (err) {
        console.error('Error loading playlist:', err);
        setError('Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylistData();
  }, [params.id, getPlaylist, getPlaylistItems]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromPlaylist(itemId);
      // Reload items
      const updatedItems = await getPlaylistItems(params.id);
      setItems(updatedItems);

      // Update playlist item count
      if (playlist) {
        const updatedPlaylist = await getPlaylist(params.id);
        if (updatedPlaylist) {
          setPlaylist(updatedPlaylist);
        }
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const getSurahName = (surahId: string) => {
    const surah = surahData.find((s) => s.id === parseInt(surahId));
    return surah ? surah.name : `Surah ${surahId}`;
  };

  const getReciterName = (reciterId: string) => {
    const reciter = recitersData.find(r => r.id === reciterId);
    return reciter ? reciter.name : 'Unknown Reciter';
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary">Loading playlist...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !playlist) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-text mb-2">
            {error || 'Playlist not found'}
          </h1>
          <p className="text-secondary text-center mb-4">
            The playlist you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
          </p>
          <Button onClick={() => router.push('/collection')}>
            <Library size={16} strokeWidth={2} className="mr-2" />
            Back to Collection
          </Button>
        </div>
      </main>
    );
  }

  const colorClass = PLAYLIST_COLOR_CLASSES[playlist.color] || 'bg-blue-500';

  // Breadcrumb items for playlist page
  const breadcrumbItems = [
    { label: 'Collection', href: '/collection', icon: Library },
    { label: playlist.name, href: `/collection/playlist/${params.id}` },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/collection')}
          className="mt-1"
        >
          <ArrowLeft size={16} strokeWidth={2} className="mr-2" />
          Back
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('w-4 h-4 rounded-full', colorClass)} />
            <SectionHeader>{playlist.name}</SectionHeader>
          </div>

          {playlist.description && (
            <p className="text-secondary mb-2">{playlist.description}</p>
          )}

          <p className="text-hint text-sm">
            {items.length} {items.length === 1 ? 'recitation' : 'recitations'} •
            Created {new Date(playlist.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-card flex items-center justify-center mx-auto">
            <Music size={32} className="text-icon" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-medium text-text mb-2">
            No recitations yet
          </h3>
          <p className="text-secondary mb-4">
            Start building your playlist by adding Quran recitations from surahs or reciters.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/mushaf')} variant="ghost">
              <BookOpen size={16} strokeWidth={2} className="mr-2" />
              Browse Surahs
            </Button>
            <Button onClick={() => router.push('/reciters')}>
              <Mic size={16} strokeWidth={2} className="mr-2" />
              Browse Reciters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={item.id} className="p-4 hover:bg-hover transition-colors group">
              <div className="flex items-center gap-4">
                {/* Index */}
                <div className="w-8 text-center text-hint text-sm font-medium">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-medium text-text">
                    {getSurahName(item.surahId)}
                  </h4>
                  <p className="text-secondary text-sm">
                    {getReciterName(item.reciterId)}
                    {item.rewayatId && ` • ${item.rewayatId}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Link href={`/mushaf/${item.surahId}`}>
                    <IconButton
                      size="sm"
                      title="View Surah"
                    >
                      <Eye size={16} strokeWidth={2} />
                    </IconButton>
                  </Link>

                  <IconButton
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove from playlist"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Navigation Suggestions */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-divider)' }}>
        <NavigationHelper showRelated={true} showNext={true} />
      </div>
    </main>
  );
}