'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { DhikrDisplay } from './DhikrDisplay';
import { Dhikr } from '@/types/adhkar';
import { useAdhkarStore } from '@/stores/useAdhkarStore';
import { cn } from '@/lib/cn';

interface DhikrListProps {
  adhkar: Dhikr[];
  categoryName?: string;
  showCompact?: boolean;
}

export function DhikrList({ adhkar, categoryName, showCompact = false }: DhikrListProps) {
  const [expandedDhikr, setExpandedDhikr] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  const { getDhikrCount, isDhikrSaved, incrementDhikrCount } = useAdhkarStore();

  if (adhkar.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-[color:var(--color-card)] flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[color:var(--color-label)] mb-2">
          No adhkar found
        </h3>
        <p className="text-[color:var(--color-secondary)]">
          {categoryName ? `No adhkar available in "${categoryName}".` : 'No adhkar match your criteria.'}
        </p>
      </Card>
    );
  }

  // Cards view - show full DhikrDisplay components
  if (viewMode === 'cards' || !showCompact) {
    return (
      <div className="space-y-6">
        {/* View mode toggle */}
        {showCompact && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[color:var(--color-label)]">
              {categoryName && `${categoryName} - `}
              {adhkar.length} {adhkar.length === 1 ? 'dhikr' : 'adhkar'}
            </h3>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
            </div>
          </div>
        )}

        {adhkar.map((dhikr, index) => (
          <DhikrDisplay
            key={dhikr.id}
            dhikr={dhikr}
            className="scroll-mt-24"
          />
        ))}
      </div>
    );
  }

  // List view - compact display
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--color-label)]">
          {categoryName && `${categoryName} - `}
          {adhkar.length} {adhkar.length === 1 ? 'dhikr' : 'adhkar'}
        </h3>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={(viewMode as string) === 'cards' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
        </div>
      </div>

      {/* Compact list */}
      <div className="space-y-2">
        {adhkar.map((dhikr, index) => {
          const isExpanded = expandedDhikr === dhikr.id;
          const currentCount = getDhikrCount(dhikr.id);
          const isSaved = isDhikrSaved(dhikr.id);
          const isCompleted = currentCount >= dhikr.repeatCount;

          return (
            <Card key={dhikr.id} className="overflow-hidden">
              {/* Compact header */}
              <div
                className="p-4 cursor-pointer hover:bg-[color:var(--color-hover)] transition-colors"
                onClick={() => setExpandedDhikr(isExpanded ? null : dhikr.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Index */}
                    <div className="w-8 h-8 rounded-full bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {dhikr.instruction && (
                          <p className="text-sm text-[color:var(--color-secondary)] truncate">
                            {dhikr.instruction}
                          </p>
                        )}

                        {isSaved && (
                          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </div>

                      <p className="text-right text-base text-[color:var(--color-label)] line-clamp-2" dir="rtl">
                        {dhikr.arabic}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-center">
                        <div className={cn(
                          'text-lg font-bold',
                          isCompleted ? 'text-green-600' : 'text-[color:var(--color-label)]'
                        )}>
                          {currentCount}
                        </div>
                        <div className="text-xs text-[color:var(--color-hint)]">
                          of {dhikr.repeatCount}
                        </div>
                      </div>

                      <div className="w-8 h-8 relative">
                        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-[color:var(--color-card-border)]"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            fill="none"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className={isCompleted ? 'stroke-green-500' : 'stroke-blue-500'}
                            style={{
                              strokeDasharray: `${2 * Math.PI * 12}`,
                              strokeDashoffset: `${2 * Math.PI * 12 * (1 - Math.min(currentCount / dhikr.repeatCount, 1))}`,
                              transition: 'stroke-dashoffset 0.3s ease'
                            }}
                          />
                        </svg>
                        {isCompleted && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick count button */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementDhikrCount(dhikr.id);
                      }}
                      size="sm"
                      title="Quick count"
                      className="flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </IconButton>

                    {/* Expand indicator */}
                    <svg
                      className={cn(
                        'w-5 h-5 text-[color:var(--color-icon)] transition-transform flex-shrink-0',
                        isExpanded ? 'rotate-180' : ''
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-[color:var(--color-divider)]">
                  <DhikrDisplay dhikr={dhikr} className="border-0 rounded-none" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}