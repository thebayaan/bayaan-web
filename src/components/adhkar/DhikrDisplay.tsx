'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Dhikr } from '@/types/adhkar';
import { useAdhkarStore } from '@/stores/useAdhkarStore';
import { cn } from '@/lib/cn';

interface DhikrDisplayProps {
  dhikr: Dhikr;
  className?: string;
}

export function DhikrDisplay({ dhikr, className }: DhikrDisplayProps) {
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);

  const {
    incrementDhikrCount,
    resetDhikrCount,
    getDhikrCount,
    toggleSavedDhikr,
    isDhikrSaved,
  } = useAdhkarStore();

  const currentCount = getDhikrCount(dhikr.id);
  const isSaved = isDhikrSaved(dhikr.id);
  const isCompleted = currentCount >= dhikr.repeatCount;

  const handleIncrement = () => {
    incrementDhikrCount(dhikr.id);
  };

  const handleReset = () => {
    resetDhikrCount(dhikr.id);
  };

  const handleToggleSaved = () => {
    toggleSavedDhikr(dhikr.id);
  };

  const handleCopy = () => {
    const text = [
      dhikr.arabic,
      dhikr.translation,
      dhikr.transliteration
    ].filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4">
        {/* Instruction */}
        {dhikr.instruction && (
          <p className="text-sm text-[color:var(--color-secondary)] flex-1">
            {dhikr.instruction}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <IconButton
            onClick={handleToggleSaved}
            size="sm"
            title={isSaved ? 'Remove from saved' : 'Save dhikr'}
            className={cn(
              'transition-colors',
              isSaved ? 'text-yellow-500 hover:text-yellow-600' : 'text-[color:var(--color-icon)]'
            )}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </IconButton>

          <IconButton
            onClick={handleCopy}
            size="sm"
            title="Copy dhikr"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8z" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Arabic text */}
      <div className="mb-6">
        <p className="text-2xl leading-relaxed text-[color:var(--color-label)] text-right mb-4" dir="rtl">
          {dhikr.arabic}
        </p>
      </div>

      {/* Translation toggle buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={showTranslation ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setShowTranslation(!showTranslation)}
          disabled={!dhikr.translation}
        >
          Translation
        </Button>
        {dhikr.transliteration && (
          <Button
            variant={showTransliteration ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowTransliteration(!showTransliteration)}
          >
            Transliteration
          </Button>
        )}
      </div>

      {/* Translation */}
      {showTranslation && dhikr.translation && (
        <div className="mb-4">
          <p className="text-base text-[color:var(--color-secondary)] leading-relaxed">
            {dhikr.translation}
          </p>
        </div>
      )}

      {/* Transliteration */}
      {showTransliteration && dhikr.transliteration && (
        <div className="mb-4">
          <p className="text-base text-[color:var(--color-hint)] italic leading-relaxed">
            {dhikr.transliteration}
          </p>
        </div>
      )}

      {/* Counter section */}
      <div className="border-t border-[color:var(--color-divider)] pt-4">
        <div className="flex items-center justify-between">
          {/* Count display */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={cn(
                'text-2xl font-bold',
                isCompleted ? 'text-green-600' : 'text-[color:var(--color-label)]'
              )}>
                {currentCount}
              </div>
              <div className="text-sm text-[color:var(--color-hint)]">
                of {dhikr.repeatCount}
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex-1 max-w-48">
              <div className="w-full bg-[color:var(--color-card)] rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  )}
                  style={{
                    width: `${Math.min(100, (currentCount / dhikr.repeatCount) * 100)}%`
                  }}
                />
              </div>
              {isCompleted && (
                <div className="text-sm text-green-600 font-medium mt-1 text-center">
                  Completed! ✓
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={currentCount === 0}
            >
              Reset
            </Button>
            <Button
              onClick={handleIncrement}
              size="lg"
              className="min-w-[120px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Count
            </Button>
          </div>
        </div>
      </div>

      {/* Audio controls (placeholder for future implementation) */}
      {dhikr.audioFile && (
        <div className="border-t border-[color:var(--color-divider)] pt-4 mt-4">
          <div className="flex items-center gap-3">
            <IconButton size="sm" title="Play audio">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
              </svg>
            </IconButton>
            <span className="text-sm text-[color:var(--color-hint)]">
              Audio available
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}