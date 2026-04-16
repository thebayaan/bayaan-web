import rawData from "./adhkar.json";

interface RawCategory {
  id: string;
  title: string;
  audio_url: string;
  broad_tags: string[];
  dhikr_count: number;
}

interface RawDhikr {
  id: string;
  category_id: string;
  category_name: string;
  arabic: string;
  translation: string;
  transliteration: string;
  instruction: string;
  repeat_count: number;
  audio_url: string;
  order_index: number;
  audio_file: string;
}

interface RawAdhkarData {
  adhkar: RawDhikr[];
  categories: RawCategory[];
}

const data = rawData as unknown as RawAdhkarData;

export interface AdhkarCategory {
  id: string;
  title: string;
  tags: string[];
  dhikrCount: number;
  audioUrl: string;
}

export interface Dhikr {
  id: string;
  categoryId: string;
  arabic: string;
  translation: string;
  transliteration: string;
  instruction: string;
  repeatCount: number;
  orderIndex: number;
  audioUrl: string;
}

function toCategory(raw: RawCategory): AdhkarCategory {
  return {
    id: raw.id,
    title: raw.title,
    tags: raw.broad_tags,
    dhikrCount: raw.dhikr_count,
    audioUrl: raw.audio_url,
  };
}

function toDhikr(raw: RawDhikr): Dhikr {
  return {
    id: raw.id,
    categoryId: raw.category_id,
    arabic: raw.arabic,
    translation: raw.translation,
    transliteration: raw.transliteration,
    instruction: raw.instruction,
    repeatCount: raw.repeat_count || 1,
    orderIndex: raw.order_index,
    audioUrl: raw.audio_url,
  };
}

const categories: AdhkarCategory[] = data.categories.map(toCategory);
const adhkarById: Map<string, Dhikr> = new Map(data.adhkar.map(toDhikr).map((d) => [d.id, d]));
const adhkarByCategory: Map<string, Dhikr[]> = new Map();
for (const dhikr of adhkarById.values()) {
  const list = adhkarByCategory.get(dhikr.categoryId) ?? [];
  list.push(dhikr);
  adhkarByCategory.set(dhikr.categoryId, list);
}
for (const list of adhkarByCategory.values()) {
  list.sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getCategories(): AdhkarCategory[] {
  return categories;
}

export function getCategoryById(id: string): AdhkarCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function getDhikrByCategory(categoryId: string): Dhikr[] {
  return adhkarByCategory.get(categoryId) ?? [];
}

export function getDhikrById(id: string): Dhikr | undefined {
  return adhkarById.get(id);
}

const TAG_COLORS: Record<string, string> = {
  daily: "#f59e0b",
  prayer: "#10b981",
  home: "#06b6d4",
  general: "#8b5cf6",
  food: "#f97316",
  travel: "#3b82f6",
  health: "#ef4444",
  marriage: "#ec4899",
  death: "#6b7280",
  protection: "#14b8a6",
  rain: "#0ea5e9",
};

export function colorForCategory(category: AdhkarCategory): string {
  for (const tag of category.tags) {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  }
  return "#64748b";
}
