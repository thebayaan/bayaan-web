import type { Reciter } from "@/types/reciter";

/**
 * Hardcoded reciter name lists ported from the mobile app's
 * data/reciterCollections.ts. Names are matched against the API's
 * reciter list using normalized comparison so minor spelling diffs
 * (diacritics, hyphens, spacing) don't break the match.
 */

const FEATURED: string[] = [
  "Abdullah Qarafi",
  "Bandar Balilah",
  "Abdulrasheed Soufi",
  "Ahmad Talib bin Humaid",
  "Ahmad Alhuthaifi",
  "Abdulrahman Al-Majed",
  "Albaraa Basfar",
  "Hasan Saleh",
];

const EXCLUSIVES: string[] = [
  "Albaraa Basfar",
  "Hazem Hassan",
  "Mohammed Hamed",
  "Malik Ahmad",
  "Hani Alhussaini",
  "Ayyub Asif",
  "Abdulrahman Mosad",
];

const TAJWEED: string[] = [
  "Mahmoud Khalil Al-Hussary",
  "Mohammed Ayyub",
  "Mohammed Siddiq Al-Minshawi",
  "Abdulbasit Abdulsamad",
  "Mahmoud Ali Albanna",
  "Mustafa Ismail",
  "Abdulrasheen Soufi",
];

const MEMORIZATION: string[] = [
  "Mishary Alafasi",
  "Mahmoud Khalil Al-Hussary",
  "Mohammed Siddiq Al-Minshawi Muallim",
  "Khalifa Al-Tunaiji",
  "Mohammed Jibreel",
  "Salah Al-Budair",
  "Abdullah Al-Mattrod",
  "Idrees Abkr",
  "Yassin Al-Jazaery",
  "Abu Bakr Al-Shatri",
];

const BEGINNER_FRIENDLY: string[] = [
  "Mishary Alafasi",
  "Maher Al Meaqli",
  "Shaik Abu Bakr Ak Shatri",
  "Abdulrahman Alsudaes",
  "Abdullah Basfer",
  "Saad Al-Ghamdi",
  "Saud Al-Shuraim",
  "Nasser Al-Qatami",
  "Yasser Al-Dosari",
  "Noreen Mohammad Siddiq",
  "Ahmad Al-Ajmy",
];

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchByName(names: string[], reciters: Reciter[]): Reciter[] {
  const normalizedMap = new Map<string, Reciter>();
  for (const r of reciters) normalizedMap.set(normalize(r.name), r);
  return names
    .map((name) => normalizedMap.get(normalize(name)))
    .filter((r): r is Reciter => r !== undefined);
}

export function getFeaturedReciters(reciters: Reciter[]): Reciter[] {
  return matchByName(FEATURED, reciters);
}

export function getExclusives(reciters: Reciter[]): Reciter[] {
  return matchByName(EXCLUSIVES, reciters);
}

export function getTajweedReciters(reciters: Reciter[]): Reciter[] {
  return matchByName(TAJWEED, reciters);
}

export function getMemorizationReciters(reciters: Reciter[]): Reciter[] {
  return matchByName(MEMORIZATION, reciters);
}

export function getBeginnerFriendlyReciters(reciters: Reciter[]): Reciter[] {
  return matchByName(BEGINNER_FRIENDLY, reciters);
}
