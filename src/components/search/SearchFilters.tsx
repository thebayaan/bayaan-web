'use client';

import { useState } from 'react';
import { useSearchStore } from '@/stores/useSearchStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { SearchResultType } from '@/lib/searchService';

const RESULT_TYPES: Array<{ value: SearchResultType | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'All Results', icon: '🔍' },
  { value: 'verse', label: 'Verses', icon: '📖' },
  { value: 'surah', label: 'Surahs', icon: '📜' },
  { value: 'reciter', label: 'Reciters', icon: '🎙️' },
  { value: 'dhikr', label: 'Adhkar', icon: '🤲' },
];

const LANGUAGE_OPTIONS = [
  { value: 'all', label: 'All Languages' },
  { value: 'arabic', label: 'Arabic Only' },
  { value: 'translation', label: 'Translation Only' },
  { value: 'transliteration', label: 'Transliteration Only' },
];

export function SearchFilters() {
  const {
    filters,
    selectedResultType,
    showFilters,
    setFilters,
    setSelectedResultType,
    toggleFilters,
  } = useSearchStore();

  const [surahStart, setSurahStart] = useState(filters.surahRange?.start?.toString() || '1');
  const [surahEnd, setSurahEnd] = useState(filters.surahRange?.end?.toString() || '114');

  const handleSurahRangeChange = () => {
    const start = parseInt(surahStart);
    const end = parseInt(surahEnd);

    if (start >= 1 && end <= 114 && start <= end) {
      setFilters({
        ...filters,
        surahRange: { start, end },
      });
    }
  };

  const handleLanguageChange = (language: string) => {
    setFilters({
      ...filters,
      language: language as 'arabic' | 'translation' | 'transliteration' | 'all',
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedResultType('all');
    setSurahStart('1');
    setSurahEnd('114');
  };

  const hasActiveFilters = selectedResultType !== 'all' ||
    filters.language !== undefined ||
    filters.surahRange !== undefined;

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={toggleFilters}
          className="flex items-center gap-2"
        >
          <svg
            className={cn(
              'w-4 h-4 transition-transform',
              showFilters ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">
              Active
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-[color:var(--color-secondary)] hover:text-[color:var(--color-label)]"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Content */}
      {showFilters && (
        <Card className="p-4 space-y-6">
          {/* Result Type Filter */}
          <div>
            <h4 className="text-sm font-medium text-[color:var(--color-label)] mb-3">
              Content Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {RESULT_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedResultType(type.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedResultType === type.value
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-[color:var(--color-card)] text-[color:var(--color-label)] hover:bg-[color:var(--color-hover)] border border-[color:var(--color-card-border)]'
                  )}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Filter */}
          <div>
            <h4 className="text-sm font-medium text-[color:var(--color-label)] mb-3">
              Language
            </h4>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    (filters.language === option.value || (filters.language === undefined && option.value === 'all'))
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-[color:var(--color-card)] text-[color:var(--color-label)] hover:bg-[color:var(--color-hover)] border border-[color:var(--color-card-border)]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surah Range Filter */}
          {(selectedResultType === 'verse' || selectedResultType === 'all') && (
            <div>
              <h4 className="text-sm font-medium text-[color:var(--color-label)] mb-3">
                Surah Range
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[color:var(--color-secondary)]">From:</label>
                  <input
                    type="number"
                    min="1"
                    max="114"
                    value={surahStart}
                    onChange={(e) => setSurahStart(e.target.value)}
                    onBlur={handleSurahRangeChange}
                    className="w-16 px-2 py-1 text-sm border border-[color:var(--color-card-border)] rounded bg-[color:var(--color-background)] text-[color:var(--color-label)]"
                  />
                </div>
                <span className="text-[color:var(--color-hint)]">to</span>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[color:var(--color-secondary)]">To:</label>
                  <input
                    type="number"
                    min="1"
                    max="114"
                    value={surahEnd}
                    onChange={(e) => setSurahEnd(e.target.value)}
                    onBlur={handleSurahRangeChange}
                    className="w-16 px-2 py-1 text-sm border border-[color:var(--color-card-border)] rounded bg-[color:var(--color-background)] text-[color:var(--color-label)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[color:var(--color-hint)] mt-1">
                Filter verses by Surah numbers (1-114)
              </p>
            </div>
          )}

          {/* Quick Filter Presets */}
          <div>
            <h4 className="text-sm font-medium text-[color:var(--color-label)] mb-3">
              Quick Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedResultType('verse');
                  setFilters({ ...filters, language: 'arabic' });
                }}
              >
                Arabic Verses Only
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedResultType('verse');
                  setFilters({ ...filters, surahRange: { start: 1, end: 30 } });
                  setSurahStart('1');
                  setSurahEnd('30');
                }}
              >
                First 30 Surahs
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedResultType('dhikr');
                }}
              >
                Adhkar Only
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}