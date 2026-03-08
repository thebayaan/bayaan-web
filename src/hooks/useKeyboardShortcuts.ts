'use client';

import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  meta?: boolean; // Cmd on Mac, Ctrl on Windows/Linux
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

/**
 * Custom hook for managing global keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const isMetaMatch = shortcut.meta ? (event.metaKey || event.ctrlKey) : !event.metaKey && !event.ctrlKey;
        const isCtrlMatch = shortcut.ctrl ? event.ctrlKey : !shortcut.ctrl;
        const isShiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const isAltMatch = shortcut.alt ? event.altKey : !event.altKey;
        const isKeyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (isMetaMatch && isCtrlMatch && isShiftMatch && isAltMatch && isKeyMatch) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook specifically for search shortcut (Cmd/Ctrl + K)
 */
export function useSearchShortcut(onSearchFocus: () => void) {
  useKeyboardShortcuts([
    {
      key: 'k',
      meta: true,
      callback: onSearchFocus,
      description: 'Focus search',
    },
  ]);
}

/**
 * Get the appropriate modifier key display for the current platform
 */
export function getModifierKey(): string {
  if (typeof window === 'undefined') return 'Ctrl';
  return navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl';
}