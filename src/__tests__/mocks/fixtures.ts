import type { Reciter } from "@/types/reciter";

export const mockReciters: Reciter[] = [
  {
    id: "reciter-1",
    name: "Mishary Rashid Alafasy",
    name_arabic: "مشاري راشد العفاسي",
    slug: "mishary-alafasy",
    image_url: "https://cdn.example.com/alafasy.jpg",
    is_featured: true,
    rewayat: [
      {
        id: "rewayat-1",
        reciter_id: "reciter-1",
        name: "Hafs an Asim",
        style: "murattal",
        server: "https://server.example.com/alafasy/",
        source_type: "mp3quran",
        surah_total: 114,
        surah_list: Array.from({ length: 114 }, (_, i) => i + 1),
        mp3quran_read_id: 11,
        qdc_reciter_id: null,
      },
    ],
  },
  {
    id: "reciter-2",
    name: "Abdul Basit Abdus Samad",
    name_arabic: "عبد الباسط عبد الصمد",
    slug: "abdul-basit",
    is_featured: false,
    rewayat: [],
  },
];
