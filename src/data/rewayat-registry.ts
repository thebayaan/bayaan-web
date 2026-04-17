/**
 * Canonical Qira'at rewayat registry, ported from mobile's data/rewayat.ts.
 * Ordered by the 10 Qira'at teachers in their traditional sequence.
 */

export interface RewayatEntry {
  id: string;
  name: string;
  displayName: string;
  description: string;
  teacher: string;
  student: string;
}

export const REWAYAT_REGISTRY: readonly RewayatEntry[] = [
  {
    id: "warsh-an-nafi",
    name: "Warsh A'n Nafi'",
    displayName: "Warsh",
    description: "Narration of Warsh from Imam Nafi'",
    teacher: "Nafi'",
    student: "Warsh",
  },
  {
    id: "qalon-an-nafi",
    name: "Qalon A'n Nafi'",
    displayName: "Qalon",
    description: "Narration of Qalon from Imam Nafi'",
    teacher: "Nafi'",
    student: "Qalon",
  },
  {
    id: "albizi-an-ibn-katheer",
    name: "Albizi A'n Ibn Katheer",
    displayName: "Al-Bazzi",
    description: "Narration of Al-Bazzi from Ibn Katheer",
    teacher: "Ibn Katheer",
    student: "Albizi",
  },
  {
    id: "qunbol-an-ibn-katheer",
    name: "Qunbol A'n Ibn Katheer",
    displayName: "Qunbol",
    description: "Narration of Qunbol from Ibn Katheer",
    teacher: "Ibn Katheer",
    student: "Qunbol",
  },
  {
    id: "aldori-an-abi-amr",
    name: "Aldori A'n Abi Amr",
    displayName: "Al-Dori",
    description: "Narration of Al-Dori from Abi Amr",
    teacher: "Abi Amr",
    student: "Aldori",
  },
  {
    id: "assosi-an-abi-amr",
    name: "Assosi A'n Abi Amr",
    displayName: "Al-Sosi",
    description: "Narration of Al-Sosi from Abi Amr",
    teacher: "Abi Amr",
    student: "Assosi",
  },
  {
    id: "ibn-thakwan-an-ibn-amer",
    name: "Ibn Thakwan A'n Ibn Amer",
    displayName: "Ibn Thakwan",
    description: "Narration of Ibn Thakwan from Ibn Amer",
    teacher: "Ibn Amer",
    student: "Ibn Thakwan",
  },
  {
    id: "hesham-an-ibn-amer",
    name: "Hesham A'n Ibn Amer",
    displayName: "Hesham",
    description: "Narration of Hesham from Ibn Amer",
    teacher: "Ibn Amer",
    student: "Hesham",
  },
  {
    id: "hafs-an-assem",
    name: "Hafs A'n Assem",
    displayName: "Hafs",
    description: "Narration of Hafs from Imam Assem",
    teacher: "Assem",
    student: "Hafs",
  },
  {
    id: "shubah-an-assem",
    name: "Shu'bah A'n Assem",
    displayName: "Shu'bah",
    description: "Narration of Shu'bah from Imam Assem",
    teacher: "Assem",
    student: "Shu'bah",
  },
  {
    id: "khalaf-an-hamzah",
    name: "Khalaf A'n Hamzah",
    displayName: "Khalaf",
    description: "Narration of Khalaf from Hamzah",
    teacher: "Hamzah",
    student: "Khalaf",
  },
  {
    id: "khallad-an-hamzah",
    name: "Khallad A'n Hamzah",
    displayName: "Khallad",
    description: "Narration of Khallad from Hamzah",
    teacher: "Hamzah",
    student: "Khallad",
  },
  {
    id: "aldorai-an-alkisaai",
    name: "AlDorai A'n Al-Kisa'ai",
    displayName: "Al-Dorai",
    description: "Narration of Al-Dorai from Al-Kisa'ai",
    teacher: "Al-Kisa'ai",
    student: "AlDorai",
  },
  {
    id: "abu-al-harith-an-alkisai",
    name: "Abu Al-Harith A'n Al-Kisa'i",
    displayName: "Abu Al-Harith",
    description: "Narration of Abu Al-Harith from Al-Kisa'ai",
    teacher: "Al-Kisa'ai",
    student: "Abu Al-Harith",
  },
  {
    id: "ibn-jammaz-an-abi-jafar",
    name: "Ibn Jammaz A'n Abi Ja'far",
    displayName: "Ibn Jammaz",
    description: "Narration of Ibn Jammaz from Abi Ja'far",
    teacher: "Abi Ja'far",
    student: "Ibn Jammaz",
  },
  {
    id: "ibn-wardan-an-abi-jafar",
    name: "Ibn Wardan A'n Abi Ja'far",
    displayName: "Ibn Wardan",
    description: "Narration of Ibn Wardan from Abi Ja'far",
    teacher: "Abi Ja'far",
    student: "Ibn Wardan",
  },
  {
    id: "rowis-rawh-an-yakoob",
    name: "Rowis and Rawh A'n Yakoob Al Hadrami",
    displayName: "Rowis & Rawh",
    description: "Narration of Rowis and Rawh from Ya'qub",
    teacher: "Yakoob",
    student: "Rowis and Rawh",
  },
  {
    id: "rawh-an-yaqub",
    name: "Rawh A'n Ya'qub",
    displayName: "Rawh",
    description: "Narration of Rawh from Ya'qub",
    teacher: "Yakoob",
    student: "Rawh",
  },
  {
    id: "ruwais-an-yaqub",
    name: "Ruwais A'n Ya'qub",
    displayName: "Ruwais",
    description: "Narration of Ruwais from Ya'qub",
    teacher: "Yakoob",
    student: "Ruwais",
  },
  {
    id: "idris-an-khalaf",
    name: "Idris A'n Khalaf Al-Bazzar",
    displayName: "Idris",
    description: "Narration of Idris from Khalaf Al-Bazzar",
    teacher: "Khalaf",
    student: "Idris",
  },
  {
    id: "ishaq-an-khalaf",
    name: "Ishaq A'n Khalaf Al-Bazzar",
    displayName: "Ishaq",
    description: "Narration of Ishaq from Khalaf Al-Bazzar",
    teacher: "Khalaf",
    student: "Ishaq",
  },
];

export const QIRAAT_TEACHERS: readonly string[] = [
  "Nafi'",
  "Ibn Katheer",
  "Abi Amr",
  "Ibn Amer",
  "Assem",
  "Hamzah",
  "Al-Kisa'ai",
  "Abi Ja'far",
  "Yakoob",
  "Khalaf",
];

/** Group the registry by teacher in canonical order. */
export function getRewayatByTeacher(): Array<{ teacher: string; entries: RewayatEntry[] }> {
  return QIRAAT_TEACHERS.map((teacher) => ({
    teacher,
    entries: REWAYAT_REGISTRY.filter((r) => r.teacher === teacher),
  }));
}

export function getRewayatById(id: string): RewayatEntry | undefined {
  return REWAYAT_REGISTRY.find((r) => r.id === id);
}
