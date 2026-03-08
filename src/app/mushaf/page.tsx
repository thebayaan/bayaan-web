import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SurahCard } from "@/components/mushaf/SurahCard";
import surahData from "@/data/surahData.json";
import type { Surah } from "@/types/quran";

export const metadata: Metadata = {
  title: "Mushaf",
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
