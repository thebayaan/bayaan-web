'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useSearchStore } from '@/stores/useSearchStore';
import { cn } from '@/lib/cn';
import type { SearchResult } from '@/lib/searchService';

const TYPE_ICONS = {
  verse: '📖',
  surah: '📜',
  reciter: '🎙️',
  dhikr: '🤲',
};

const TYPE_COLORS = {
  verse: 'bg-green-100 text-green-800',
  surah: 'bg-blue-100 text-blue-800',
  reciter: 'bg-purple-100 text-purple-800',
  dhikr: 'bg-orange-100 text-orange-800',
};

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
}

function SearchResultItem({ result, query }: SearchResultItemProps) {
  const { getResultUrl } = useSearchStore();
  const url = getResultUrl(result);

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 text-yellow-900 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Link href={url}>
      <Card className="p-4 hover:bg-[color:var(--color-hover)] transition-colors cursor-pointer group">
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className="flex-shrink-0">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                TYPE_COLORS[result.type]
              )}
            >
              {TYPE_ICONS[result.type]}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-[color:var(--color-label)] group-hover:text-blue-600 transition-colors">
                {highlightText(result.title, query)}
              </h3>
              <span
                className={cn(
                  'px-2 py-1 text-xs rounded-full font-medium capitalize',
                  TYPE_COLORS[result.type]
                )}
              >
                {result.type}
              </span>
            </div>

            {/* Subtitle */}
            {result.subtitle && (
              <p className="text-sm text-[color:var(--color-secondary)] mb-2">
                {highlightText(result.subtitle, query)}
              </p>
            )}

            {/* Content */}
            <div className="space-y-2">
              {/* Arabic Content */}
              {result.arabicContent && (
                <p className="text-right text-lg text-[color:var(--color-label)] leading-relaxed" dir="rtl">
                  {highlightText(result.arabicContent, query)}
                </p>
              )}

              {/* Translation */}
              {result.translationContent && (
                <p className="text-[color:var(--color-secondary)] leading-relaxed">
                  {highlightText(result.translationContent, query)}
                </p>
              )}

              {/* Transliteration */}
              {result.transliterationContent && (
                <p className="text-[color:var(--color-hint)] italic text-sm">
                  {highlightText(result.transliterationContent, query)}
                </p>
              )}

              {/* Fallback content if no specific content */}
              {!result.arabicContent && !result.translationContent && !result.transliterationContent && (
                <p className="text-[color:var(--color-secondary)]">
                  {highlightText(result.content, query)}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-3 text-xs text-[color:var(--color-hint)]">
              {result.metadata.surahName && (
                <span>📜 {result.metadata.surahName}</span>
              )}
              {result.metadata.ayahNumber && (
                <span>🔢 Verse {result.metadata.ayahNumber}</span>
              )}
              {result.metadata.reciterName && (
                <span>🎙️ {result.metadata.reciterName}</span>
              )}
              {result.metadata.categoryName && (
                <span>📂 {result.metadata.categoryName}</span>
              )}
              {result.relevanceScore > 0 && (
                <span className="ml-auto">
                  Match: {Math.round(result.relevanceScore)}%
                </span>
              )}
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-[color:var(--color-icon)] group-hover:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function SearchResults() {
  const {
    query,
    results,
    isSearching,
    hasSearched,
    error,
    selectedResultType,
  } = useSearchStore();

  if (!hasSearched && !isSearching) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[color:var(--color-card)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[color:var(--color-label)] mb-2">
          Search the Holy Quran
        </h3>
        <p className="text-[color:var(--color-secondary)] max-w-md mx-auto">
          Find verses, surahs, reciters, and adhkar. Search in Arabic, translation, or transliteration.
        </p>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[color:var(--color-secondary)]">
          Searching for &quot;{query}&quot;...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[color:var(--color-label)] mb-2">
          Search Error
        </h3>
        <p className="text-red-600 mb-4">
          {error}
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[color:var(--color-card)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[color:var(--color-label)] mb-2">
          No results found
        </h3>
        <p className="text-[color:var(--color-secondary)] mb-4">
          No {selectedResultType !== 'all' ? selectedResultType : 'content'} found for &quot;{query}&quot;.
          Try different keywords or adjust your filters.
        </p>
        <div className="text-sm text-[color:var(--color-hint)] space-y-1">
          <p>💡 Try searching for:</p>
          <ul className="list-none space-y-1">
            <li>• Specific verse numbers (e.g., &quot;Ayah 255&quot;)</li>
            <li>• Surah names (e.g., &quot;Al-Fatiha&quot;, &quot;Baqarah&quot;)</li>
            <li>• Arabic words or phrases</li>
            <li>• Translation keywords</li>
            <li>• Reciter names</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--color-label)]">
            Search Results
          </h2>
          <p className="text-sm text-[color:var(--color-secondary)]">
            Found {results.length} result{results.length === 1 ? '' : 's'} for &quot;{query}&quot;
            {selectedResultType !== 'all' && ` in ${selectedResultType}s`}
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <SearchResultItem
            key={`${result.type}-${result.id}-${index}`}
            result={result}
            query={query}
          />
        ))}
      </div>

      {/* Load More (placeholder for pagination) */}
      {results.length >= 50 && (
        <div className="text-center py-4">
          <p className="text-sm text-[color:var(--color-hint)]">
            Showing first 50 results. Refine your search for more specific results.
          </p>
        </div>
      )}
    </div>
  );
}