import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconButton } from "@/components/ui/IconButton";
import { SurahHeader } from "@/components/mushaf/SurahHeader";
import { VerseDisplay } from "@/components/mushaf/VerseDisplay";
import surahData from "@/data/surahData.json";
import quranData from "@/data/quran.json";
import type { Surah, QuranData, Verse } from "@/types/quran";

interface SurahPageProps {
  params: Promise<{ surah: string }>;
}

export async function generateMetadata({
  params,
}: SurahPageProps): Promise<Metadata> {
  const { surah } = await params;
  const surahId = parseInt(surah);
  const surahInfo = (surahData as Surah[]).find(s => s.id === surahId);

  if (!surahInfo) {
    return { title: "Surah Not Found" };
  }

  return {
    title: `${surahInfo.name} (${surahInfo.name_arabic})`,
    description: `Read Surah ${surahInfo.name} - ${surahInfo.translated_name_english} from the Holy Quran`,
  };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { surah } = await params;
  const surahId = parseInt(surah);

  // Find surah info
  const surahInfo = (surahData as Surah[]).find(s => s.id === surahId);
  if (!surahInfo) {
    notFound();
  }

  // Get verses for this surah
  const allQuranData = quranData as QuranData;
  const verses: Verse[] = Object.values(allQuranData)
    .filter(verse => verse.surah_number === surahId)
    .sort((a, b) => a.ayah_number - b.ayah_number);

  const nextSurah = surahData.find(s => s.id === surahId + 1);
  const prevSurah = surahData.find(s => s.id === surahId - 1);

  return (
    <main className="container mx-auto max-w-4xl p-4" id="main-content">
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link href="/mushaf">
            <IconButton label="Back to Mushaf">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </IconButton>
          </Link>

          <div className="flex items-center gap-2">
            {prevSurah && (
              <Link href={`/mushaf/${prevSurah.id}`}>
                <IconButton label={`Previous: ${prevSurah.name}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </IconButton>
              </Link>
            )}
            {nextSurah && (
              <Link href={`/mushaf/${nextSurah.id}`}>
                <IconButton label={`Next: ${nextSurah.name}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </IconButton>
              </Link>
            )}
          </div>
        </div>

        {/* Surah Header */}
        <SurahHeader surah={surahInfo} />

        {/* Verses */}
        <div className="space-y-1">
          {verses.map(verse => (
            <VerseDisplay
              key={verse.id}
              verse={verse}
              surahNumber={surahId}
              surahName={surahInfo.name}
            />
          ))}
        </div>

        {/* Bottom Navigation */}
        {(prevSurah || nextSurah) && (
          <div className="flex items-center justify-between pt-8">
            {prevSurah ? (
              <Link href={`/mushaf/${prevSurah.id}`} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[color:var(--color-hover)]">
                <svg className="h-5 w-5 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div>
                  <p className="text-sm text-[color:var(--color-hint)]">Previous</p>
                  <p className="font-semibold text-[color:var(--color-label)]">{prevSurah.name}</p>
                </div>
              </Link>
            ) : <div />}

            {nextSurah ? (
              <Link href={`/mushaf/${nextSurah.id}`} className="flex items-center gap-3 rounded-lg p-3 text-right transition-colors hover:bg-[color:var(--color-hover)]">
                <div>
                  <p className="text-sm text-[color:var(--color-hint)]">Next</p>
                  <p className="font-semibold text-[color:var(--color-label)]">{nextSurah.name}</p>
                </div>
                <svg className="h-5 w-5 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : <div />}
          </div>
        )}
      </div>
    </main>
  );
}
