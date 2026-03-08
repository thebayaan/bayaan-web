import quranData from '@/data/quran.json';
import surahData from '@/data/surahData.json';
import recitersData from '@/data/reciters.json';
import adhkarData from '@/data/adhkar.json';
import type { Verse, Surah } from '@/types/quran';
import type { Reciter } from '@/types/reciter';
import type { AdhkarSeedData } from '@/types/adhkar';

export type SearchResultType = 'verse' | 'surah' | 'reciter' | 'dhikr';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  content: string;
  arabicContent?: string;
  translationContent?: string;
  transliterationContent?: string;
  metadata: {
    surahNumber?: number;
    ayahNumber?: number;
    surahName?: string;
    reciterName?: string;
    categoryName?: string;
    [key: string]: string | number | boolean | undefined;
  };
  relevanceScore: number;
}

export interface SearchFilters {
  types: SearchResultType[];
  surahRange?: { start: number; end: number };
  language?: 'arabic' | 'translation' | 'transliteration' | 'all';
}

export interface SearchOptions {
  query: string;
  filters?: Partial<SearchFilters>;
  limit?: number;
  exactMatch?: boolean;
}

class SearchService {
  private searchIndex: Map<string, SearchResult[]> = new Map();
  private allResults: SearchResult[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    this.buildSearchIndex();
    this.isInitialized = true;
  }

  private buildSearchIndex() {
    // Index verses
    const verses = Object.values(quranData) as Verse[];
    verses.forEach(verse => {
      const surah = (surahData as Surah[]).find(s => s.id === verse.surah_number);
      const result: SearchResult = {
        id: `verse_${verse.id}`,
        type: 'verse',
        title: `${surah?.name || `Surah ${verse.surah_number}`} - Ayah ${verse.ayah_number}`,
        subtitle: surah?.translated_name_english,
        content: verse.text,
        arabicContent: verse.text,
        translationContent: verse.translation || undefined,
        transliterationContent: verse.transliteration || undefined,
        metadata: {
          surahNumber: verse.surah_number,
          ayahNumber: verse.ayah_number,
          surahName: surah?.name,
          verseKey: verse.verse_key,
        },
        relevanceScore: 0,
      };

      this.addToIndex(result, [
        verse.text,
        verse.translation || '',
        verse.transliteration || '',
        surah?.name || '',
        surah?.translated_name_english || '',
        `ayah ${verse.ayah_number}`,
        `verse ${verse.ayah_number}`,
      ]);
    });

    // Index surahs
    (surahData as Surah[]).forEach(surah => {
      const result: SearchResult = {
        id: `surah_${surah.id}`,
        type: 'surah',
        title: surah.name,
        subtitle: surah.translated_name_english,
        content: `${surah.name} - ${surah.translated_name_english}`,
        arabicContent: surah.name_arabic,
        metadata: {
          surahNumber: surah.id,
          revelation_place: surah.revelation_place,
          verses_count: surah.verses_count,
        },
        relevanceScore: 0,
      };

      this.addToIndex(result, [
        surah.name,
        surah.name_arabic,
        surah.translated_name_english,
        surah.revelation_place,
        `surah ${surah.id}`,
        `chapter ${surah.id}`,
      ]);
    });

    // Index reciters
    (recitersData as Reciter[]).forEach(reciter => {
      const result: SearchResult = {
        id: `reciter_${reciter.id}`,
        type: 'reciter',
        title: reciter.name,
        subtitle: `${reciter.rewayat?.length || 0} recitation(s)`,
        content: reciter.name,
        arabicContent: reciter.name,
        metadata: {
          reciterName: reciter.name,
          rewayatCount: reciter.rewayat?.length || 0,
          reciterId: reciter.id,
        },
        relevanceScore: 0,
      };

      this.addToIndex(result, [
        reciter.name,
        'reciter',
        'qari',
        ...(reciter.rewayat?.map(r => r.name) || []),
      ]);
    });

    // Index adhkar/dhikr
    const adhkarSeedData = adhkarData as AdhkarSeedData;
    adhkarSeedData.adhkar.forEach(dhikr => {
      const category = adhkarSeedData.categories.find(c => c.id === dhikr.category_id);
      const result: SearchResult = {
        id: `dhikr_${dhikr.id}`,
        type: 'dhikr',
        title: dhikr.instruction || 'Dhikr',
        subtitle: category?.title,
        content: dhikr.arabic,
        arabicContent: dhikr.arabic,
        translationContent: dhikr.translation || undefined,
        transliterationContent: dhikr.transliteration || undefined,
        metadata: {
          categoryName: category?.title,
          categoryId: dhikr.category_id,
          repeatCount: dhikr.repeat_count,
          orderIndex: dhikr.order_index,
        },
        relevanceScore: 0,
      };

      this.addToIndex(result, [
        dhikr.arabic,
        dhikr.translation || '',
        dhikr.transliteration || '',
        dhikr.instruction || '',
        category?.title || '',
        'dhikr',
        'adhkar',
        'dua',
        'supplication',
      ]);
    });

    console.log(`Search index built with ${this.allResults.length} items`);
  }

  private addToIndex(result: SearchResult, searchTerms: string[]) {
    this.allResults.push(result);

    // Create search tokens from terms
    const tokens = new Set<string>();

    searchTerms.forEach(term => {
      if (!term) return;

      // Add full term
      const cleanTerm = term.toLowerCase().trim();
      tokens.add(cleanTerm);

      // Add individual words
      cleanTerm.split(/\s+/).forEach(word => {
        if (word.length > 2) {
          tokens.add(word);
        }
      });

      // Add partial matches for longer terms
      if (cleanTerm.length > 4) {
        for (let i = 0; i <= cleanTerm.length - 3; i++) {
          tokens.add(cleanTerm.substring(i, i + 3));
        }
      }
    });

    // Index by tokens
    tokens.forEach(token => {
      if (!this.searchIndex.has(token)) {
        this.searchIndex.set(token, []);
      }
      this.searchIndex.get(token)!.push(result);
    });
  }

  private calculateRelevance(result: SearchResult, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Exact title match gets highest score
    if (result.title.toLowerCase() === queryLower) {
      score += 100;
    } else if (result.title.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Subtitle match
    if (result.subtitle && result.subtitle.toLowerCase().includes(queryLower)) {
      score += 30;
    }

    // Content matches
    if (result.content.toLowerCase().includes(queryLower)) {
      score += 20;
    }

    if (result.arabicContent && result.arabicContent.includes(query)) {
      score += 40; // Arabic matches are important
    }

    if (result.translationContent && result.translationContent.toLowerCase().includes(queryLower)) {
      score += 25;
    }

    if (result.transliterationContent && result.transliterationContent.toLowerCase().includes(queryLower)) {
      score += 15;
    }

    // Boost scores based on type relevance
    if (result.type === 'verse') score += 10;
    if (result.type === 'surah') score += 5;

    // Word boundary matches get bonus
    const wordRegex = new RegExp(`\\b${queryLower}\\b`, 'i');
    if (wordRegex.test(result.content)) {
      score += 15;
    }

    return score;
  }

  search(options: SearchOptions): SearchResult[] {
    const { query, filters = {}, limit = 50, exactMatch = false } = options;

    if (!query.trim()) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const matchedResults = new Set<SearchResult>();

    // Find results using index
    if (exactMatch) {
      // Exact match search
      const exactResults = this.searchIndex.get(queryLower) || [];
      exactResults.forEach(result => matchedResults.add(result));
    } else {
      // Fuzzy search - find all tokens that contain the query
      for (const [token, results] of this.searchIndex.entries()) {
        if (token.includes(queryLower)) {
          results.forEach(result => matchedResults.add(result));
        }
      }

      // Also search for query words individually
      queryLower.split(/\s+/).forEach(word => {
        if (word.length > 2) {
          for (const [token, results] of this.searchIndex.entries()) {
            if (token.includes(word)) {
              results.forEach(result => matchedResults.add(result));
            }
          }
        }
      });
    }

    // Filter results
    let filteredResults = Array.from(matchedResults);

    if (filters.types && filters.types.length > 0) {
      filteredResults = filteredResults.filter(result =>
        filters.types!.includes(result.type)
      );
    }

    if (filters.surahRange) {
      const { start, end } = filters.surahRange;
      filteredResults = filteredResults.filter(result => {
        const surahNum = result.metadata.surahNumber;
        return surahNum && surahNum >= start && surahNum <= end;
      });
    }

    if (filters.language && filters.language !== 'all') {
      filteredResults = filteredResults.filter(result => {
        switch (filters.language) {
          case 'arabic':
            return !!result.arabicContent;
          case 'translation':
            return !!result.translationContent;
          case 'transliteration':
            return !!result.transliterationContent;
          default:
            return true;
        }
      });
    }

    // Calculate relevance and sort
    const resultsWithScore = filteredResults.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevance(result, query),
    }));

    resultsWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return resultsWithScore.slice(0, limit);
  }

  // Get suggestions for autocomplete
  getSuggestions(query: string, limit = 10): string[] {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Find matching tokens
    for (const token of this.searchIndex.keys()) {
      if (token.startsWith(queryLower) && token.length > query.length) {
        suggestions.add(token);
        if (suggestions.size >= limit) break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  // Get popular search terms based on content
  getPopularTerms(): string[] {
    const surahNames = (surahData as Surah[]).map(s => s.name);
    const reciterNames = (recitersData as Reciter[]).slice(0, 10).map(r => r.name);
    const commonTerms = [
      'Allah', 'Muhammad', 'prayer', 'peace', 'mercy', 'forgiveness',
      'guidance', 'paradise', 'hell', 'day of judgment', 'believers'
    ];

    return [...surahNames.slice(0, 10), ...reciterNames, ...commonTerms];
  }
}

// Export singleton instance
export const searchService = new SearchService();