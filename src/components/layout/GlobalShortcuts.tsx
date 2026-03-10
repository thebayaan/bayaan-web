'use client';

import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface GlobalShortcutsProps {
  onShowShortcutsHelp?: () => void;
}

/**
 * GlobalShortcuts - Provides app-wide keyboard shortcuts for navigation and player controls
 */
export function GlobalShortcuts({ onShowShortcutsHelp }: GlobalShortcutsProps) {
  const router = useRouter();
  const {
    playback,
    play,
    pause,
    skipNext,
    skipPrevious,
    hasNextTrack,
    hasPreviousTrack,
    getCurrentTrack
  } = usePlayerStore();

  const currentTrack = getCurrentTrack();

  useKeyboardShortcuts([
    // Navigation shortcuts
    {
      key: '1',
      meta: true,
      callback: () => router.push('/'),
      description: 'Go to Home',
    },
    {
      key: '2',
      meta: true,
      callback: () => router.push('/mushaf'),
      description: 'Go to Mushaf',
    },
    {
      key: '3',
      meta: true,
      callback: () => router.push('/reciters'),
      description: 'Go to Reciters',
    },
    {
      key: '4',
      meta: true,
      callback: () => router.push('/adhkar'),
      description: 'Go to Adhkar',
    },
    {
      key: '5',
      meta: true,
      callback: () => router.push('/collection'),
      description: 'Go to Collection',
    },
    {
      key: '6',
      meta: true,
      callback: () => router.push('/search'),
      description: 'Go to Search',
    },
    {
      key: '7',
      meta: true,
      callback: () => router.push('/settings'),
      description: 'Go to Settings',
    },

    // Player controls
    {
      key: ' ', // Spacebar
      callback: async () => {
        if (!currentTrack) return;

        try {
          if (playback.state === 'playing') {
            pause();
          } else {
            await play();
          }
        } catch (error) {
          console.error('Playback toggle error:', error);
        }
      },
      description: 'Play/Pause',
    },
    {
      key: 'ArrowRight',
      callback: async () => {
        if (!hasNextTrack()) return;

        try {
          await skipNext();
        } catch (error) {
          console.error('Skip next error:', error);
        }
      },
      description: 'Next track',
    },
    {
      key: 'ArrowLeft',
      callback: async () => {
        if (!hasPreviousTrack()) return;

        try {
          await skipPrevious();
        } catch (error) {
          console.error('Skip previous error:', error);
        }
      },
      description: 'Previous track',
    },

    // Quick actions
    {
      key: 'Escape',
      callback: () => {
        // Close any open modals/dialogs by dispatching a custom event
        document.dispatchEvent(new CustomEvent('closeModals'));
      },
      description: 'Close modals/dialogs',
    },
    {
      key: '/',
      callback: () => {
        router.push('/search');
        // Focus search input after navigation
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      },
      description: 'Quick search',
    },
    {
      key: '?',
      meta: true,
      callback: () => {
        if (onShowShortcutsHelp) {
          onShowShortcutsHelp();
        }
      },
      description: 'Show keyboard shortcuts',
    },
  ]);

  return null; // This component only handles shortcuts, no UI
}