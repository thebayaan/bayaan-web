export interface AdhkarCategory {
  id: string;
  name: string;
  name_arabic: string;
  description: string;
  count: number;
  color: string;
}

export interface Dhikr {
  id: string;
  category_id: string;
  text_arabic: string;
  translation: string;
  repetitions: number;
  reference: string;
}

export const ADHKAR_CATEGORIES: AdhkarCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    name_arabic: "أذكار الصباح",
    description: "Remembrances for the morning",
    count: 12,
    color: "#f59e0b",
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    name_arabic: "أذكار المساء",
    description: "Remembrances for the evening",
    count: 12,
    color: "#6366f1",
  },
  {
    id: "after-prayer",
    name: "After Prayer",
    name_arabic: "أذكار بعد الصلاة",
    description: "Remembrances after salah",
    count: 8,
    color: "#10b981",
  },
  {
    id: "sleep",
    name: "Before Sleep",
    name_arabic: "أذكار النوم",
    description: "Remembrances before sleeping",
    count: 6,
    color: "#8b5cf6",
  },
  {
    id: "wakeup",
    name: "Upon Waking",
    name_arabic: "أذكار الاستيقاظ",
    description: "Remembrances upon waking",
    count: 4,
    color: "#f97316",
  },
  {
    id: "general",
    name: "General Adhkar",
    name_arabic: "أذكار عامة",
    description: "Everyday remembrances",
    count: 10,
    color: "#06b6d4",
  },
];

export const SAMPLE_DHIKR: Dhikr[] = [
  {
    id: "1",
    category_id: "morning",
    text_arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    translation:
      "We have reached the morning and at this very time all sovereignty belongs to Allah. Praise is for Allah. None has the right to be worshipped except Allah alone, without any partner.",
    repetitions: 1,
    reference: "Muslim",
  },
  {
    id: "2",
    category_id: "morning",
    text_arabic:
      "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    translation:
      "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.",
    repetitions: 1,
    reference: "Tirmidhi",
  },
  {
    id: "3",
    category_id: "morning",
    text_arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    translation: "Glory is to Allah and praise is to Him.",
    repetitions: 100,
    reference: "Muslim",
  },
];

export function getCategoryById(id: string): AdhkarCategory | undefined {
  return ADHKAR_CATEGORIES.find((c) => c.id === id);
}

export function getDhikrByCategory(categoryId: string): Dhikr[] {
  return SAMPLE_DHIKR.filter((d) => d.category_id === categoryId);
}
