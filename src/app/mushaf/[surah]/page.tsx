import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Mic } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { SurahHeader } from "@/components/mushaf/SurahHeader";
import { VerseDisplay } from "@/components/mushaf/VerseDisplay";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { NavigationHelper, SequenceNavigation } from "@/components/layout/NavigationHelper";
import { ReadingSessionManager } from "@/components/reading/ReadingSessionManager";
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

  // Breadcrumb items for this specific surah page
  const breadcrumbItems = [
    { label: 'Mushaf', href: '/mushaf', icon: BookOpen },
    { label: `${surahInfo.name}`, href: `/mushaf/${surahId}` },
  ];

  return (
    <main className="container mx-auto max-w-4xl p-4" id="main-content">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <Link href="/mushaf">
            <IconButton label="Back to Mushaf">
              <ArrowLeft size={20} strokeWidth={2} />
            </IconButton>
          </Link>

          {/* Listen to Audio Action */}
          <Link
            href="/reciters"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]"
          >
            <Mic size={16} strokeWidth={2} />
            <span>Listen to Audio</span>
          </Link>
        </div>

        {/* Surah Header */}
        <SurahHeader surah={surahInfo} />

        {/* Reading Session Manager */}
        <ReadingSessionManager
          surahNumber={surahId}
          surahName={surahInfo.name}
          totalVerses={surahInfo.verses_count}
          currentVerse={1}
        />

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

        {/* Navigation and Suggestions */}
        <div className="pt-8 border-t space-y-6" style={{ borderColor: 'var(--color-divider)' }}>
          {/* Sequence Navigation */}
          <SequenceNavigation
            previousHref={prevSurah ? `/mushaf/${prevSurah.id}` : undefined}
            nextHref={nextSurah ? `/mushaf/${nextSurah.id}` : undefined}
            previousLabel={prevSurah ? `${prevSurah.name}` : undefined}
            nextLabel={nextSurah ? `${nextSurah.name}` : undefined}
          />

          {/* Navigation Suggestions */}
          <NavigationHelper showRelated={true} showNext={true} />
        </div>
      </div>
    </main>
  );
}
