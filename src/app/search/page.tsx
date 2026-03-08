'use client';

import { useEffect } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearchStore } from '@/stores/useSearchStore';

export default function SearchPage() {
  const { clearError } = useSearchStore();

  useEffect(() => {
    // Clear any previous errors when page loads
    clearError();
  }, [clearError]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <SectionHeader>Search</SectionHeader>
          <p className="text-[color:var(--color-secondary)] mt-2">
            Search the Holy Quran, Surahs, Reciters, and Adhkar
          </p>
        </div>

        {/* Search Input */}
        <SearchInput autoFocus />

        {/* Search Filters */}
        <SearchFilters />

        {/* Search Results */}
        <SearchResults />
      </div>
    </main>
  );
}
