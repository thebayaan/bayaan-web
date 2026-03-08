'use client';

import { useState, useRef, useEffect } from 'react';
import { HighlightColor, HIGHLIGHT_COLORS } from '@/types/verse-annotations';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface HighlightSelectorProps {
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  currentColor: HighlightColor | null;
  onHighlight: (verseKey: string, surahNumber: number, ayahNumber: number, color: HighlightColor) => Promise<void>;
  onRemoveHighlight: (verseKey: string) => Promise<void>;
  size?: 'sm' | 'md';
  className?: string;
}

const HIGHLIGHT_COLOR_CLASSES: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-300 hover:bg-yellow-400',
  green: 'bg-green-300 hover:bg-green-400',
  blue: 'bg-blue-300 hover:bg-blue-400',
  orange: 'bg-orange-300 hover:bg-orange-400',
  purple: 'bg-purple-300 hover:bg-purple-400',
};

export function HighlightSelector({
  verseKey,
  surahNumber,
  ayahNumber,
  currentColor,
  onHighlight,
  onRemoveHighlight,
  size = 'sm',
  className
}: HighlightSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleColorSelect = async (color: HighlightColor) => {
    if (loading) return;

    setLoading(true);
    try {
      await onHighlight(verseKey, surahNumber, ayahNumber, color);
      setIsOpen(false);
    } catch (error) {
      console.error('Error setting highlight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      await onRemoveHighlight(verseKey);
      setIsOpen(false);
    } catch (error) {
      console.error('Error removing highlight:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton
        size={size}
        onClick={toggleDropdown}
        disabled={loading}
        className={cn(
          'transition-colors',
          currentColor
            ? 'text-accent hover:text-accent/80'
            : 'text-icon hover:text-accent',
          className
        )}
        title={currentColor ? 'Change highlight' : 'Add highlight'}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : currentColor ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5h10m-10 0l5.5-5.5m-5.5 5.5l5.5 5.5"/>
          </svg>
        )}
      </IconButton>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-card border border-card-border rounded-lg shadow-lg py-2 z-50">
          {/* Color options */}
          <div className="px-3 py-2">
            <div className="text-xs text-label mb-2 font-medium">Highlight Color</div>
            <div className="flex gap-2">
              {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  disabled={loading}
                  className={cn(
                    'w-6 h-6 rounded border-2 transition-all',
                    HIGHLIGHT_COLOR_CLASSES[color],
                    currentColor === color
                      ? 'border-accent ring-1 ring-accent/20'
                      : 'border-card-border hover:border-accent',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                  title={`${color.charAt(0).toUpperCase() + color.slice(1)} highlight`}
                />
              ))}
            </div>
          </div>

          {/* Remove highlight option */}
          {currentColor && (
            <>
              <div className="h-px bg-divider mx-2" />
              <button
                onClick={handleRemove}
                disabled={loading}
                className="w-full px-3 py-2 text-left text-sm text-icon hover:text-text hover:bg-hover transition-colors flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Highlight
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}