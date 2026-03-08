import { create } from 'zustand';
import { adhkarService } from '@/lib/adhkarService';
import {
  AdhkarCategory,
  Dhikr,
  AdhkarBroadTag,
  DhikrCount,
  SavedDhikr
} from '@/types/adhkar';

// Local storage helpers for dhikr counts and saved adhkar
const DHIKR_COUNTS_KEY = 'bayaan-dhikr-counts';
const SAVED_ADHKAR_KEY = 'bayaan-saved-adhkar';

const getDhikrCounts = (): Record<string, DhikrCount> => {
  try {
    const stored = localStorage.getItem(DHIKR_COUNTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveDhikrCounts = (counts: Record<string, DhikrCount>) => {
  try {
    localStorage.setItem(DHIKR_COUNTS_KEY, JSON.stringify(counts));
  } catch (error) {
    console.error('Failed to save dhikr counts:', error);
  }
};

const getSavedAdhkar = (): Record<string, SavedDhikr> => {
  try {
    const stored = localStorage.getItem(SAVED_ADHKAR_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveSavedAdhkar = (saved: Record<string, SavedDhikr>) => {
  try {
    localStorage.setItem(SAVED_ADHKAR_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error('Failed to save adhkar:', error);
  }
};

interface AdhkarState {
  // Data
  categories: AdhkarCategory[];
  adhkar: Dhikr[];

  // Current state
  selectedCategory: AdhkarCategory | null;
  selectedDhikr: Dhikr | null;

  // Search & filtering
  searchQuery: string;
  selectedTag: AdhkarBroadTag | null;

  // Dhikr progress tracking
  dhikrCounts: Record<string, DhikrCount>;
  savedAdhkar: Record<string, SavedDhikr>;

  // UI state
  loading: boolean;
  error: string | null;

  // Actions
  loadData: () => void;

  // Category actions
  setSelectedCategory: (category: AdhkarCategory | null) => void;

  // Dhikr actions
  setSelectedDhikr: (dhikr: Dhikr | null) => void;
  getDhikrsByCategory: (categoryId: string) => Dhikr[];

  // Search actions
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: AdhkarBroadTag | null) => void;
  getFilteredCategories: () => AdhkarCategory[];

  // Progress tracking
  incrementDhikrCount: (dhikrId: string) => void;
  resetDhikrCount: (dhikrId: string) => void;
  getDhikrCount: (dhikrId: string) => number;

  // Saved adhkar management
  toggleSavedDhikr: (dhikrId: string) => void;
  isDhikrSaved: (dhikrId: string) => boolean;
  getSavedAdhkarList: () => Dhikr[];

  // Utility
  clearError: () => void;
}

export const useAdhkarStore = create<AdhkarState>((set, get) => ({
  // Initial state
  categories: [],
  adhkar: [],
  selectedCategory: null,
  selectedDhikr: null,
  searchQuery: '',
  selectedTag: null,
  dhikrCounts: getDhikrCounts(),
  savedAdhkar: getSavedAdhkar(),
  loading: false,
  error: null,

  // Load data from service
  loadData: () => {
    try {
      set({ loading: true, error: null });

      const categories = adhkarService.getAllCategories();
      const adhkar = adhkarService.getAllAdhkar();

      set({
        categories,
        adhkar,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load adhkar data:', error);
      set({
        error: 'Failed to load adhkar data',
        loading: false,
      });
    }
  },

  // Category actions
  setSelectedCategory: (category: AdhkarCategory | null) => {
    set({ selectedCategory: category, selectedDhikr: null });
  },

  // Dhikr actions
  setSelectedDhikr: (dhikr: Dhikr | null) => {
    set({ selectedDhikr: dhikr });
  },

  getDhikrsByCategory: (categoryId: string) => {
    return adhkarService.getAdhkarByCategory(categoryId);
  },

  // Search actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedTag: (tag: AdhkarBroadTag | null) => {
    set({ selectedTag: tag });
  },

  getFilteredCategories: () => {
    const { categories, searchQuery, selectedTag } = get();

    let filtered = [...categories];

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(cat => cat.broadTags.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(cat =>
        cat.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  // Progress tracking
  incrementDhikrCount: (dhikrId: string) => {
    const { dhikrCounts } = get();
    const now = Date.now();

    const newCounts = {
      ...dhikrCounts,
      [dhikrId]: {
        dhikrId,
        count: (dhikrCounts[dhikrId]?.count || 0) + 1,
        lastUpdated: now,
      },
    };

    set({ dhikrCounts: newCounts });
    saveDhikrCounts(newCounts);
  },

  resetDhikrCount: (dhikrId: string) => {
    const { dhikrCounts } = get();

    const newCounts = { ...dhikrCounts };
    delete newCounts[dhikrId];

    set({ dhikrCounts: newCounts });
    saveDhikrCounts(newCounts);
  },

  getDhikrCount: (dhikrId: string) => {
    const { dhikrCounts } = get();
    return dhikrCounts[dhikrId]?.count || 0;
  },

  // Saved adhkar management
  toggleSavedDhikr: (dhikrId: string) => {
    const { savedAdhkar } = get();
    const now = Date.now();

    const newSaved = { ...savedAdhkar };

    if (savedAdhkar[dhikrId]) {
      delete newSaved[dhikrId];
    } else {
      newSaved[dhikrId] = {
        dhikrId,
        createdAt: now,
      };
    }

    set({ savedAdhkar: newSaved });
    saveSavedAdhkar(newSaved);
  },

  isDhikrSaved: (dhikrId: string) => {
    const { savedAdhkar } = get();
    return !!savedAdhkar[dhikrId];
  },

  getSavedAdhkarList: () => {
    const { savedAdhkar, adhkar } = get();
    const savedIds = Object.keys(savedAdhkar);

    return adhkar
      .filter(dhikr => savedIds.includes(dhikr.id))
      .sort((a, b) => {
        const aCreated = savedAdhkar[a.id].createdAt;
        const bCreated = savedAdhkar[b.id].createdAt;
        return bCreated - aCreated; // Most recent first
      });
  },

  // Utility
  clearError: () => set({ error: null }),
}));