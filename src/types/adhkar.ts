export type AdhkarBroadTag =
  | 'daily'
  | 'prayer'
  | 'protection'
  | 'health'
  | 'travel'
  | 'food'
  | 'social'
  | 'nature'
  | 'spiritual'
  | 'home'
  | 'clothing'
  | 'general';

export interface AdhkarCategory {
  id: string;
  title: string;
  dhikrCount: number;
  broadTags: AdhkarBroadTag[];
}

export interface Dhikr {
  id: string;
  categoryId: string;
  arabic: string;
  translation: string | null;
  transliteration: string | null;
  instruction: string | null;
  repeatCount: number;
  audioFile: string | null;
  sortOrder: number;
}

export interface SavedDhikr {
  dhikrId: string;
  createdAt: number;
}

export interface DhikrCount {
  dhikrId: string;
  count: number;
  lastUpdated: number;
}

export type SuperCategorySection = 'main' | 'other';

export interface SuperCategory {
  id: string;
  title: string;
  arabicTitle: string | null;
  color: string;
  heightMultiplier: number;
  column: 'left' | 'right';
  sortOrder: number;
  section: SuperCategorySection;
  categoryIds: string[];
}

export interface AdhkarSeedData {
  meta?: {
    total_categories: number;
    total_adhkar?: number;
    total_duas?: number;
    audio_source: string;
    source_book: string;
    audio_local_dir?: string;
    total_audio_size_mb?: number;
  };
  categories: Array<{
    id: string;
    title: string;
    broad_tags: string[];
    dhikr_count: number;
  }>;
  adhkar: Array<{
    id: string;
    category_id: string;
    arabic: string;
    translation: string | null;
    transliteration: string | null;
    instruction: string | null;
    repeat_count: number;
    audio_file: string | null;
    order_index: number;
  }>;
}
