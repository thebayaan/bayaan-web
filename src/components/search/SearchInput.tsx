'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchStore } from '@/stores/useSearchStore';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface SearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
  className?: string;
}

export function SearchInput({
  placeholder = 'Search Quran, Surahs, Reciters, Adhkar...',
  autoFocus = false,
  onEnter,
  className,
}: SearchInputProps) {
  const {
    query,
    suggestions,
    searchHistory,
    popularTerms,
    isSearching,
    setQuery,
    search,
    clearSearch,
    addToHistory,
  } = useSearchStore();

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search();
      setShowSuggestions(false);
      inputRef.current?.blur();
      onEnter?.();
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim().length > 0 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    search({ query: suggestion });
    setShowSuggestions(false);
    addToHistory(suggestion);
  };

  // Handle clear search
  const handleClear = () => {
    clearSearch();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Get suggestions to show
  const getSuggestionsToShow = () => {
    const items: Array<{ text: string; type: 'suggestion' | 'history' | 'popular'; icon?: string }> = [];

    // Add query-based suggestions first
    if (query.trim().length > 2 && suggestions.length > 0) {
      suggestions.slice(0, 5).forEach(suggestion => {
        items.push({ text: suggestion, type: 'suggestion', icon: '🔍' });
      });
    }

    // Add search history if no query or short query
    if (query.trim().length <= 2 && searchHistory.length > 0) {
      searchHistory.slice(0, 5).forEach(historyItem => {
        items.push({ text: historyItem, type: 'history', icon: '🕒' });
      });
    }

    // Add popular terms if we have space and no query
    if (query.trim().length === 0 && items.length < 6) {
      popularTerms.slice(0, 6 - items.length).forEach(term => {
        items.push({ text: term, type: 'popular', icon: '⭐' });
      });
    }

    return items;
  };

  const suggestionsToShow = getSuggestionsToShow();

  return (
    <div className={cn('relative', className)}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            'relative flex items-center',
            'border border-[color:var(--color-card-border)] rounded-lg',
            'bg-[color:var(--color-background)]',
            'transition-all duration-200',
            isFocused
              ? 'ring-2 ring-blue-500 border-blue-500'
              : 'hover:border-[color:var(--color-hover)]'
          )}
        >
          {/* Search Icon */}
          <div className="absolute left-3 flex items-center">
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full pl-10 pr-20 py-3',
              'text-[color:var(--color-label)] placeholder-[color:var(--color-hint)]',
              'bg-transparent border-none outline-none',
              'text-base'
            )}
          />

          {/* Actions */}
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <IconButton
                onClick={handleClear}
                size="sm"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isSearching}
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestionsToShow.length > 0 && (
        <div
          ref={suggestionsRef}
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-[color:var(--color-background)] border border-[color:var(--color-card-border)]',
            'rounded-lg shadow-lg max-h-80 overflow-y-auto'
          )}
        >
          <div className="py-2">
            {suggestionsToShow.map((item, index) => (
              <button
                key={`${item.type}-${item.text}-${index}`}
                onClick={() => handleSuggestionClick(item.text)}
                className={cn(
                  'w-full px-4 py-2 flex items-center gap-3',
                  'hover:bg-[color:var(--color-hover)] transition-colors',
                  'text-left text-[color:var(--color-label)]'
                )}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="flex-1 truncate">{item.text}</span>
                <span className="text-xs text-[color:var(--color-hint)] capitalize">
                  {item.type === 'suggestion' ? 'suggestion' :
                   item.type === 'history' ? 'recent' : 'popular'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}