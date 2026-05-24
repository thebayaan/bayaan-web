export interface TafsirEdition {
  id: string;
  language: string;
  name: string;
  authorName?: string;
  direction: "ltr" | "rtl";
}

/** Curated tafsir editions (Quran.com v4 resource IDs). Mirrors Bayaan mobile catalog. */
export const AVAILABLE_TAFASEER: TafsirEdition[] = [
  {
    id: "169",
    language: "English",
    name: "Ibn Kathir (Abridged)",
    authorName: "Hafiz Ibn Kathir",
    direction: "ltr",
  },
  {
    id: "817",
    language: "English",
    name: "Tazkirul Quran",
    authorName: "Shabbir Ahmed",
    direction: "ltr",
  },
  {
    id: "168",
    language: "English",
    name: "Ma'arif al-Qur'an",
    authorName: "Mufti Muhammad Shafi",
    direction: "ltr",
  },
  {
    id: "14",
    language: "Arabic",
    name: "Tafsir Ibn Kathir",
    authorName: "Hafiz Ibn Kathir",
    direction: "rtl",
  },
  {
    id: "16",
    language: "Arabic",
    name: "Tafsir Muyassar",
    direction: "rtl",
  },
  {
    id: "15",
    language: "Arabic",
    name: "Tafsir al-Tabari",
    authorName: "Tabari",
    direction: "rtl",
  },
  {
    id: "91",
    language: "Arabic",
    name: "Al-Sa'di",
    direction: "rtl",
  },
  {
    id: "160",
    language: "Urdu",
    name: "Tafsir Ibn Kathir",
    direction: "rtl",
  },
  {
    id: "159",
    language: "Urdu",
    name: "Bayan ul Quran",
    direction: "rtl",
  },
  {
    id: "157",
    language: "Urdu",
    name: "Fi Zilal al-Quran",
    authorName: "Sayyid Qutb",
    direction: "rtl",
  },
];

export function getTafsirEditionById(id: string): TafsirEdition | undefined {
  return AVAILABLE_TAFASEER.find((edition) => edition.id === id);
}
