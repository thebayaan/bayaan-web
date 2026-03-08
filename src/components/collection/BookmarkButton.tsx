'use client';

import { useState } from 'react';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface BookmarkButtonProps {
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  isBookmarked: boolean;
  onToggle: (verseKey: string, surahNumber: number, ayahNumber: number, isBookmarked: boolean) => Promise<void>;
  size?: 'sm' | 'md';
  className?: string;
}

export function BookmarkButton({
  verseKey,
  surahNumber,
  ayahNumber,
  isBookmarked,
  onToggle,
  size = 'sm',
  className
}: BookmarkButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      await onToggle(verseKey, surahNumber, ayahNumber, isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'transition-colors',
        isBookmarked
          ? 'text-accent hover:text-accent/80'
          : 'text-icon hover:text-accent',
        className
      )}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isBookmarked ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      )}
    </IconButton>
  );
}