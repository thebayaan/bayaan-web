import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SurahCard } from "@/components/mushaf/SurahCard";
import surahData from "@/data/surahData.json";
import type { Surah } from "@/types/quran";

export const metadata: Metadata = {
  title: "Mushaf - Read the Holy Quran",
  description: "Read and explore the complete Holy Quran with 114 Surahs. Access Arabic text, translations, and detailed verse information in a beautiful digital format.",
  keywords: ["Quran", "Mushaf", "Surah", "Islamic", "Arabic", "Holy Book", "Read Quran", "Quran Text", "Islamic Scripture", "114 Surahs"],
  openGraph: {
    title: "Mushaf - Read the Holy Quran",
    description: "Read and explore the complete Holy Quran with 114 Surahs. Access Arabic text, translations, and detailed verse information.",
    type: "website",
    url: "https://bayaan.app/mushaf",
    images: [
      {
        url: "/og/mushaf.png",
        width: 1200,
        height: 630,
        alt: "Mushaf - Holy Quran Reading Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mushaf - Read the Holy Quran",
    description: "Read and explore the complete Holy Quran with 114 Surahs. Access Arabic text, translations, and detailed verse information.",
    images: ["/og/mushaf.png"],
  },
  alternates: {
    canonical: "https://bayaan.app/mushaf",
  },
};

export default function MushafPage() {
  const surahs = surahData as Surah[];

  return (
    <main className="container mx-auto max-w-4xl p-4" id="main-content">
      <div className="space-y-6">
        <SectionHeader>
          <h1 className="text-2xl font-semibold">Mushaf</h1>
          <p className="text-[color:var(--color-hint)]">
            Read and explore the Holy Quran
          </p>
        </SectionHeader>

        <div className="space-y-4">
          {surahs.map((surah) => (
            <SurahCard key={surah.id} surah={surah} />
          ))}
        </div>
      </div>
    </main>
  );
}
