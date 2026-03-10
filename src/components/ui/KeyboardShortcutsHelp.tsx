'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { X, Keyboard } from 'lucide-react';
import { getModifierKey } from '@/hooks/useKeyboardShortcuts';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: '⌘ + 1', description: 'Go to Home', category: 'Navigation' },
  { key: '⌘ + 2', description: 'Go to Mushaf', category: 'Navigation' },
  { key: '⌘ + 3', description: 'Go to Reciters', category: 'Navigation' },
  { key: '⌘ + 4', description: 'Go to Adhkar', category: 'Navigation' },
  { key: '⌘ + 5', description: 'Go to Collection', category: 'Navigation' },
  { key: '⌘ + 6', description: 'Go to Search', category: 'Navigation' },
  { key: '⌘ + 7', description: 'Go to Settings', category: 'Navigation' },

  // Player
  { key: 'Space', description: 'Play/Pause', category: 'Player' },
  { key: '→', description: 'Next track', category: 'Player' },
  { key: '←', description: 'Previous track', category: 'Player' },

  // Actions
  { key: '⌘ + K', description: 'Focus search', category: 'Actions' },
  { key: '/', description: 'Quick search', category: 'Actions' },
  { key: 'Esc', description: 'Close modals/dialogs', category: 'Actions' },
  { key: '⌘ + ?', description: 'Show keyboard shortcuts', category: 'Actions' },
];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * KeyboardShortcutsHelp - Modal showing all available keyboard shortcuts
 */
export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [modifierKey] = useState(() => {
    // Initialize with the correct modifier key for the platform
    if (typeof window === 'undefined') return '⌘';
    return getModifierKey();
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleCloseModals = () => {
      onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('closeModals', handleCloseModals);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('closeModals', handleCloseModals);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedShortcuts = SHORTCUTS.map(shortcut => ({
    ...shortcut,
    key: shortcut.key.replace('⌘', modifierKey),
  }));

  const categories = Array.from(new Set(normalizedShortcuts.map(s => s.category)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <div className="flex items-center gap-3">
            <Keyboard
              size={20}
              style={{ color: 'var(--color-icon)' }}
              strokeWidth={1.8}
            />
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-hover)]"
            aria-label="Close shortcuts help"
          >
            <X size={16} style={{ color: 'var(--color-icon)' }} strokeWidth={1.8} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-6 overflow-y-auto">
          {categories.map((category, categoryIndex) => (
            <div key={category}>
              {categoryIndex > 0 && <Divider className="my-4" />}

              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--color-label)' }}
              >
                {category}
              </h3>

              <div className="space-y-2">
                {normalizedShortcuts
                  .filter(shortcut => shortcut.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span
                        className="text-sm"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {shortcut.description}
                      </span>
                      <kbd
                        className={cn(
                          "text-xs font-mono px-2 py-1 rounded",
                          "border"
                        )}
                        style={{
                          backgroundColor: 'var(--color-card)',
                          borderColor: 'var(--color-card-border)',
                          color: 'var(--color-label)',
                        }}
                      >
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* Tip */}
          <Divider className="my-4" />
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--color-hint)' }}
          >
            Keyboard shortcuts are disabled when typing in input fields.
            Press <kbd className="px-1 py-0.5 rounded text-[10px] border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>Esc</kbd> to dismiss any active dialogs.
          </p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Hook to manage keyboard shortcuts help modal
 */
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + ? to show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}