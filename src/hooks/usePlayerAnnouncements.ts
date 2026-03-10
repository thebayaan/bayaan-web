'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useScreenReaderAnnouncements } from '@/components/layout/AccessibilityEnhancer';

/**
 * Hook to announce player state changes to screen readers
 */
export function usePlayerAnnouncements() {
  const { announce } = useScreenReaderAnnouncements();
  const { playback, getCurrentTrack } = usePlayerStore();

  const currentTrack = getCurrentTrack();

  // Announce track changes
  useEffect(() => {
    if (currentTrack) {
      announce(`Now playing: ${currentTrack.title} by ${currentTrack.reciterName}`);
    }
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.reciterName, announce]);

  // Announce playback state changes
  useEffect(() => {
    if (!currentTrack) return;

    switch (playback.state) {
      case 'playing':
        announce('Playback started', 'polite');
        break;
      case 'paused':
        announce('Playback paused', 'polite');
        break;
      case 'ended':
        announce('Track ended', 'polite');
        break;
      case 'loading':
        announce('Loading track', 'polite');
        break;
      case 'error':
        announce('Playback error occurred', 'assertive');
        break;
    }
  }, [playback.state, currentTrack, announce]);

  // Announce progress for long tracks (every 25%)
  useEffect(() => {
    const progressPercent = playback.duration > 0 ? (playback.position / playback.duration) * 100 : 0;

    if (playback.duration > 0 && playback.position > 0) {
      // Announce progress at 25%, 50%, 75% intervals for long tracks (>5 min)
      if (playback.duration > 300) { // 5 minutes
        if (Math.floor(progressPercent) % 25 === 0 && Math.floor(progressPercent) > 0) {
          announce(`${Math.floor(progressPercent)}% complete`, 'polite');
        }
      }
    }
  }, [playback.duration, playback.position, announce]);

  return { announce };
}