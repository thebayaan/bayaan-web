import { create } from 'zustand';
import { searchService } from '@/lib/searchService';
import type { SearchResult, SearchFilters, SearchResultType, SearchOptions } from '@/lib/searchService';

// Local storage key for search history
const SEARCH_HISTORY_KEY = 'bayaan-search-history';
const MAX_HISTORY_ITEMS = 10;

const getSearchHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSearchHistory = (history: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};

export interface SearchState {
  // Current search
  query: string;
  results: SearchResult[];
  filters: Partial<SearchFilters>;

  // UI state
  isSearching: boolean;
  hasSearched: boolean;
  suggestions: string[];
  showFilters: boolean;
  selectedResultType: SearchResultType | 'all';

  // History and popular
  searchHistory: string[];
  popularTerms: string[];

  // Error state
  error: string | null;

  // Actions
  setQuery: (query: string) => void;
  search: (options?: Partial<SearchOptions>) => void;
  clearSearch: () => void;

  // Filters
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSelectedResultType: (type: SearchResultType | 'all') => void;
  toggleFilters: () => void;

  // History management
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;

  // Suggestions
  getSuggestions: (query: string) => void;
  clearSuggestions: () => void;

  // Navigation helpers
  getResultUrl: (result: SearchResult) => string;

  // Utility
  clearError: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  query: '',
  results: [],
  filters: {},
  isSearching: false,
  hasSearched: false,
  suggestions: [],
  showFilters: false,
  selectedResultType: 'all',
  searchHistory: getSearchHistory(),
  popularTerms: searchService.getPopularTerms(),
  error: null,

  // Set query and get suggestions
  setQuery: (query: string) => {
    set({ query, error: null });

    // Get suggestions for non-empty queries
    if (query.trim().length > 2) {
      get().getSuggestions(query);
    } else {
      set({ suggestions: [] });
    }
  },

  // Perform search
  search: (options = {}) => {
    const { query, filters, selectedResultType } = get();

    if (!query.trim()) {
      set({
        results: [],
        hasSearched: false,
        error: 'Please enter a search term'
      });
      return;
    }

    set({ isSearching: true, error: null });

    try {
      // Build search options
      const searchOptions: SearchOptions = {
        query: query.trim(),
        filters: {
          ...filters,
          // Apply result type filter
          types: selectedResultType === 'all'
            ? undefined
            : [selectedResultType as SearchResultType],
          ...options.filters,
        },
        limit: options.limit || 50,
        exactMatch: options.exactMatch || false,
      };

      // Perform search
      const results = searchService.search(searchOptions);

      set({
        results,
        isSearching: false,
        hasSearched: true,
        suggestions: [] // Clear suggestions after search
      });

      // Add to history if we got results
      if (results.length > 0) {
        get().addToHistory(query.trim());
      }

    } catch (error) {
      console.error('Search error:', error);
      set({
        isSearching: false,
        error: error instanceof Error ? error.message : 'Search failed',
        results: [],
        hasSearched: true,
      });
    }
  },

  // Clear search state
  clearSearch: () => {
    set({
      query: '',
      results: [],
      suggestions: [],
      hasSearched: false,
      error: null,
    });
  },

  // Set search filters
  setFilters: (newFilters: Partial<SearchFilters>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };

    set({ filters: updatedFilters });

    // Re-search if we have a query and have searched before
    const { query, hasSearched } = get();
    if (query.trim() && hasSearched) {
      get().search();
    }
  },

  // Set selected result type filter
  setSelectedResultType: (type: SearchResultType | 'all') => {
    set({ selectedResultType: type });

    // Re-search if we have a query and have searched before
    const { query, hasSearched } = get();
    if (query.trim() && hasSearched) {
      get().search();
    }
  },

  // Toggle filter panel
  toggleFilters: () => {
    set({ showFilters: !get().showFilters });
  },

  // Add query to search history
  addToHistory: (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery || trimmedQuery.length < 2) return;

    const currentHistory = get().searchHistory;

    // Remove if already exists
    const filteredHistory = currentHistory.filter(
      item => item.toLowerCase() !== trimmedQuery
    );

    // Add to beginning and limit size
    const newHistory = [query.trim(), ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

    set({ searchHistory: newHistory });
    saveSearchHistory(newHistory);
  },

  // Clear search history
  clearHistory: () => {
    set({ searchHistory: [] });
    saveSearchHistory([]);
  },

  // Remove specific item from history
  removeFromHistory: (query: string) => {
    const newHistory = get().searchHistory.filter(item => item !== query);
    set({ searchHistory: newHistory });
    saveSearchHistory(newHistory);
  },

  // Get search suggestions
  getSuggestions: (query: string) => {
    try {
      const suggestions = searchService.getSuggestions(query, 8);
      set({ suggestions });
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      set({ suggestions: [] });
    }
  },

  // Clear suggestions
  clearSuggestions: () => {
    set({ suggestions: [] });
  },

  // Get URL for search result
  getResultUrl: (result: SearchResult) => {
    switch (result.type) {
      case 'verse':
        return `/mushaf/${result.metadata.surahNumber}#verse-${result.metadata.ayahNumber}`;
      case 'surah':
        return `/mushaf/${result.metadata.surahNumber}`;
      case 'reciter':
        return `/reciter/${result.id.split('_')[1]}`;
      case 'dhikr':
        return `/adhkar/${result.metadata.categoryId}#dhikr-${result.id.split('_')[1]}`;
      default:
        return '/';
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));