'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdhkarBroadTag } from '@/types/adhkar';
import { useAdhkarStore } from '@/stores/useAdhkarStore';
import { cn } from '@/lib/cn';

export function AdhkarSearch() {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
  } = useAdhkarStore();

  // Available tags with display info
  const tagOptions: { value: AdhkarBroadTag; label: string; icon: string }[] = [
    { value: 'daily', label: 'Daily', icon: '🌅' },
    { value: 'prayer', label: 'Prayer', icon: '🕌' },
    { value: 'protection', label: 'Protection', icon: '🛡️' },
    { value: 'health', label: 'Health', icon: '❤️' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'food', label: 'Food', icon: '🍽️' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'nature', label: 'Nature', icon: '🌿' },
    { value: 'spiritual', label: 'Spiritual', icon: '✨' },
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'general', label: 'General', icon: '📝' },
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
  };

  const hasActiveFilters = searchQuery.trim() || selectedTag;

  return (
    <Card className="p-4">
      {/* Search input */}
      <div className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[color:var(--color-background)] border border-[color:var(--color-card-border)] rounded-lg text-[color:var(--color-label)] placeholder-[color:var(--color-hint)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Filter by category
          {selectedTag && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">
              {tagOptions.find(t => t.value === selectedTag)?.label}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-[color:var(--color-secondary)] hover:text-[color:var(--color-label)]"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Tag filters */}
      {isExpanded && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[color:var(--color-label)]">
            Filter by type:
          </h4>

          <div className="flex flex-wrap gap-2">
            {tagOptions.map(tag => (
              <button
                key={tag.value}
                onClick={() => setSelectedTag(selectedTag === tag.value ? null : tag.value)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedTag === tag.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-[color:var(--color-card)] text-[color:var(--color-label)] hover:bg-[color:var(--color-hover)] border border-[color:var(--color-card-border)]'
                )}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-[color:var(--color-divider)]">
          <div className="flex items-center gap-2 text-sm text-[color:var(--color-secondary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <span>
              Filtering categories
              {searchQuery.trim() && ` containing "${searchQuery.trim()}"`}
              {selectedTag && ` in "${tagOptions.find(t => t.value === selectedTag)?.label}" category`}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}