import adhkarData from '@/data/adhkar.json';
import {
  AdhkarCategory,
  Dhikr,
  AdhkarSeedData,
  AdhkarBroadTag
} from '@/types/adhkar';

// Raw data types from JSON
interface RawAdhkarCategory {
  id: string;
  title: string;
  dhikr_count: number;
  broad_tags: string[];
}

interface RawDhikr {
  id: string;
  category_id: string;
  arabic: string;
  translation?: string | null;
  transliteration?: string | null;
  instruction?: string | null;
  repeat_count?: number;
  audio_file?: string | null;
  order_index?: number;
}

// Transform raw data to typed interfaces
const transformCategory = (rawCategory: RawAdhkarCategory): AdhkarCategory => ({
  id: rawCategory.id,
  title: rawCategory.title,
  dhikrCount: rawCategory.dhikr_count,
  broadTags: rawCategory.broad_tags as AdhkarBroadTag[],
});

const transformDhikr = (rawDhikr: RawDhikr): Dhikr => ({
  id: rawDhikr.id,
  categoryId: rawDhikr.category_id,
  arabic: rawDhikr.arabic,
  translation: rawDhikr.translation || null,
  transliteration: rawDhikr.transliteration || null,
  instruction: rawDhikr.instruction || null,
  repeatCount: rawDhikr.repeat_count || 1,
  audioFile: rawDhikr.audio_file || null,
  sortOrder: rawDhikr.order_index || 0,
});

class AdhkarService {
  private categories: AdhkarCategory[] = [];
  private adhkar: Dhikr[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    const data = adhkarData as AdhkarSeedData;

    this.categories = data.categories.map(transformCategory);
    this.adhkar = data.adhkar.map(transformDhikr);
  }

  // Category methods
  getAllCategories(): AdhkarCategory[] {
    return [...this.categories];
  }

  getCategoryById(id: string): AdhkarCategory | null {
    return this.categories.find(cat => cat.id === id) || null;
  }

  getCategoriesByTag(tag: AdhkarBroadTag): AdhkarCategory[] {
    return this.categories.filter(cat => cat.broadTags.includes(tag));
  }

  // Get unique tags from all categories
  getAllTags(): AdhkarBroadTag[] {
    const tags = new Set<AdhkarBroadTag>();
    this.categories.forEach(cat => {
      cat.broadTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }

  // Dhikr methods
  getAllAdhkar(): Dhikr[] {
    return [...this.adhkar];
  }

  getDhikrById(id: string): Dhikr | null {
    return this.adhkar.find(dhikr => dhikr.id === id) || null;
  }

  getAdhkarByCategory(categoryId: string): Dhikr[] {
    return this.adhkar
      .filter(dhikr => dhikr.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Search functionality
  searchCategories(query: string): AdhkarCategory[] {
    const lowerQuery = query.toLowerCase();
    return this.categories.filter(cat =>
      cat.title.toLowerCase().includes(lowerQuery)
    );
  }

  searchAdhkar(query: string): Dhikr[] {
    const lowerQuery = query.toLowerCase();
    return this.adhkar.filter(dhikr =>
      dhikr.arabic.includes(query) ||
      (dhikr.translation && dhikr.translation.toLowerCase().includes(lowerQuery)) ||
      (dhikr.transliteration && dhikr.transliteration.toLowerCase().includes(lowerQuery)) ||
      (dhikr.instruction && dhikr.instruction.toLowerCase().includes(lowerQuery))
    );
  }

  // Statistics
  getTotalCategoriesCount(): number {
    return this.categories.length;
  }

  getTotalAdhkarCount(): number {
    return this.adhkar.length;
  }

  getCategoryStats(categoryId: string): { totalDhikr: number; category: AdhkarCategory | null } {
    const category = this.getCategoryById(categoryId);
    const totalDhikr = this.getAdhkarByCategory(categoryId).length;
    return { totalDhikr, category };
  }
}

// Export singleton instance
export const adhkarService = new AdhkarService();