/**
 * Ported from mobile's AdhkarDatabaseService.ts super-category seed data.
 * Each super-category groups multiple numbered adhkar categories under a
 * single visual card with CDN background images (dark + light variants).
 */

const CDN = "https://cdn.thebayaan.com/assets/images/adhkar";

export interface AdhkarSuperCategory {
  id: string;
  title: string;
  arabicTitle: string;
  color: string;
  section: "main" | "other";
  sortOrder: number;
  categoryIds: string[];
  imageDark: string;
  imageLight: string;
}

function img(slug: string): { imageDark: string; imageLight: string } {
  return { imageDark: `${CDN}/${slug}-dark.png`, imageLight: `${CDN}/${slug}-light.png` };
}

export const MAIN_ADHKAR: AdhkarSuperCategory[] = [
  {
    id: "morning-adhkar",
    title: "Morning",
    arabicTitle: "أذكار الصباح",
    color: "#F59E0B",
    section: "main",
    sortOrder: 1,
    categoryIds: ["27"],
    ...img("morning-adhkar"),
  },
  {
    id: "evening-adhkar",
    title: "Evening",
    arabicTitle: "أذكار المساء",
    color: "#4F46E5",
    section: "main",
    sortOrder: 1,
    categoryIds: ["27"],
    ...img("evening-adhkar"),
  },
  {
    id: "salah",
    title: "Salah",
    arabicTitle: "أذكار الصلاة",
    color: "#059669",
    section: "main",
    sortOrder: 2,
    categoryIds: ["16", "17", "18", "19", "20", "21", "22", "23", "24"],
    ...img("salah"),
  },
  {
    id: "before-sleep",
    title: "Before Sleep",
    arabicTitle: "أذكار النوم",
    color: "#6366F1",
    section: "main",
    sortOrder: 2,
    categoryIds: ["28", "29", "30", "31"],
    ...img("before-sleep"),
  },
  {
    id: "after-salah",
    title: "After Salah",
    arabicTitle: "أذكار بعد الصلاة",
    color: "#10B981",
    section: "main",
    sortOrder: 3,
    categoryIds: ["25", "32", "33"],
    ...img("after-salah"),
  },
  {
    id: "waking-up",
    title: "Waking Up",
    arabicTitle: "الاستيقاظ",
    color: "#F97316",
    section: "main",
    sortOrder: 3,
    categoryIds: ["1"],
    ...img("waking-up"),
  },
  {
    id: "salawat",
    title: "Salawat",
    arabicTitle: "الصلاة على النبي",
    color: "#EC4899",
    section: "main",
    sortOrder: 4,
    categoryIds: ["107"],
    ...img("salawat"),
  },
  {
    id: "praises-of-allah",
    title: "Praises of Allah",
    arabicTitle: "الحمد والثناء",
    color: "#8B5CF6",
    section: "main",
    sortOrder: 4,
    categoryIds: ["130", "131"],
    ...img("praises-of-allah"),
  },
  {
    id: "istighfar",
    title: "Istighfar",
    arabicTitle: "الاستغفار",
    color: "#06B6D4",
    section: "main",
    sortOrder: 5,
    categoryIds: ["44", "129"],
    ...img("istighfar"),
  },
  {
    id: "nightmares",
    title: "Nightmares",
    arabicTitle: "الكوابيس",
    color: "#7C3AED",
    section: "main",
    sortOrder: 5,
    categoryIds: ["31"],
    ...img("nightmares"),
  },
  {
    id: "protection-of-iman",
    title: "Protection of Iman",
    arabicTitle: "حماية الإيمان",
    color: "#7C3AED",
    section: "main",
    sortOrder: 6,
    categoryIds: ["40", "42", "45", "88", "92", "94", "128"],
    ...img("protection-of-iman"),
  },
  {
    id: "difficulties-happiness",
    title: "Difficulties & Happiness",
    arabicTitle: "الشدة والفرح",
    color: "#F59E0B",
    section: "main",
    sortOrder: 6,
    categoryIds: ["34", "35", "43", "46", "82", "106", "122", "123", "126"],
    ...img("difficulties-happiness"),
  },
  {
    id: "quranic-duas",
    title: "Quranic Duas",
    arabicTitle: "أدعية قرآنية",
    color: "#0D9488",
    section: "main",
    sortOrder: 7,
    categoryIds: ["quranic-duas"],
    ...img("quranic-duas"),
  },
];

export const OTHER_ADHKAR: AdhkarSuperCategory[] = [
  {
    id: "names-of-allah",
    title: "99 Names of Allah",
    arabicTitle: "أسماء الله الحسنى",
    color: "#8B5CF6",
    section: "other",
    sortOrder: 0,
    categoryIds: ["names-of-allah"],
    ...img("names-of-allah"),
  },
  {
    id: "lavatory-wudu",
    title: "Lavatory & Wudu",
    arabicTitle: "الخلاء والوضوء",
    color: "#6B7280",
    section: "other",
    sortOrder: 1,
    categoryIds: ["6", "7", "8", "9"],
    ...img("lavatory-wudu"),
  },
  {
    id: "clothes",
    title: "Clothes",
    arabicTitle: "اللباس",
    color: "#6366F1",
    section: "other",
    sortOrder: 1,
    categoryIds: ["2", "3", "4", "5"],
    ...img("clothes"),
  },
  {
    id: "adhan-masjid",
    title: "Adhan & Masjid",
    arabicTitle: "الأذان والمسجد",
    color: "#059669",
    section: "other",
    sortOrder: 2,
    categoryIds: ["12", "13", "14", "15"],
    ...img("adhan-masjid"),
  },
  {
    id: "home",
    title: "Home",
    arabicTitle: "المنزل",
    color: "#F97316",
    section: "other",
    sortOrder: 2,
    categoryIds: ["10", "11", "97", "98"],
    ...img("home"),
  },
  {
    id: "istikharah",
    title: "Istikharah",
    arabicTitle: "الاستخارة",
    color: "#8B5CF6",
    section: "other",
    sortOrder: 3,
    categoryIds: ["26"],
    ...img("istikharah"),
  },
  {
    id: "gatherings",
    title: "Gatherings",
    arabicTitle: "المجالس",
    color: "#EC4899",
    section: "other",
    sortOrder: 3,
    categoryIds: ["84", "85"],
    ...img("gatherings"),
  },
  {
    id: "food-drink",
    title: "Food & Drink",
    arabicTitle: "الطعام والشراب",
    color: "#EF4444",
    section: "other",
    sortOrder: 4,
    categoryIds: ["68", "69", "70", "71", "72", "73", "74", "75", "76"],
    ...img("food-drink"),
  },
  {
    id: "travel",
    title: "Travel",
    arabicTitle: "السفر",
    color: "#F59E0B",
    section: "other",
    sortOrder: 4,
    categoryIds: ["95", "96", "99", "100", "101", "102", "103", "104", "105"],
    ...img("travel"),
  },
  {
    id: "nature",
    title: "Nature",
    arabicTitle: "الطبيعة",
    color: "#06B6D4",
    section: "other",
    sortOrder: 5,
    categoryIds: ["61", "62", "63", "64", "65", "66", "67", "110", "111"],
    ...img("nature"),
  },
  {
    id: "social-interactions",
    title: "Social Interactions",
    arabicTitle: "التعاملات الاجتماعية",
    color: "#EC4899",
    section: "other",
    sortOrder: 5,
    categoryIds: [
      "36",
      "37",
      "38",
      "39",
      "77",
      "78",
      "86",
      "87",
      "89",
      "90",
      "91",
      "93",
      "108",
      "109",
      "112",
      "113",
      "114",
      "127",
    ],
    ...img("social-interactions"),
  },
  {
    id: "hajj-umrah",
    title: "Hajj & Umrah",
    arabicTitle: "الحج والعمرة",
    color: "#F59E0B",
    section: "other",
    sortOrder: 6,
    categoryIds: ["115", "116", "117", "118", "119", "120", "121"],
    ...img("hajj-umrah"),
  },
  {
    id: "marriage-children",
    title: "Marriage & Children",
    arabicTitle: "الزواج والأولاد",
    color: "#EC4899",
    section: "other",
    sortOrder: 6,
    categoryIds: ["47", "48", "79", "80", "81"],
    ...img("marriage-children"),
  },
  {
    id: "death",
    title: "Death",
    arabicTitle: "الموت",
    color: "#6B7280",
    section: "other",
    sortOrder: 7,
    categoryIds: ["51", "52", "53", "54", "55", "56", "57", "58", "59", "60"],
    ...img("death"),
  },
  {
    id: "ruqyah-illness",
    title: "Ruqyah & Illness",
    arabicTitle: "الرقية والمرض",
    color: "#10B981",
    section: "other",
    sortOrder: 7,
    categoryIds: ["49", "50", "83", "124", "125"],
    ...img("ruqyah-illness"),
  },
  {
    id: "money-shopping",
    title: "Money & Shopping",
    arabicTitle: "المال والتسوق",
    color: "#F97316",
    section: "other",
    sortOrder: 8,
    categoryIds: ["41"],
    ...img("money-shopping"),
  },
];

export const ALL_ADHKAR_SUPER: AdhkarSuperCategory[] = [...MAIN_ADHKAR, ...OTHER_ADHKAR];

/** Map each numbered category id to its parent super-category (for thumbnails). */
export function buildSuperCategoryMap(): Map<string, AdhkarSuperCategory> {
  const map = new Map<string, AdhkarSuperCategory>();
  for (const sc of ALL_ADHKAR_SUPER) {
    for (const cid of sc.categoryIds) {
      if (!map.has(cid)) map.set(cid, sc);
    }
  }
  return map;
}

/**
 * Resolve an adhkar URL segment to the super-category slug used for CDN
 * image lookups. The `/adhkar/{superId}/...` route accepts either form:
 *   - the slug itself (e.g. `morning-adhkar`) — used by featured cards
 *   - a numeric Hisnul Muslim category id (e.g. `27`) — linked from the
 *     home page via `categoryIds[0]`
 * Returns the slug, or null when the input doesn't match any super.
 */
export function resolveAdhkarSuperSlug(superId: string): string | null {
  const direct = ALL_ADHKAR_SUPER.find((sc) => sc.id === superId);
  if (direct) return direct.id;
  const byCategoryId = ALL_ADHKAR_SUPER.find((sc) => sc.categoryIds.includes(superId));
  return byCategoryId?.id ?? null;
}
