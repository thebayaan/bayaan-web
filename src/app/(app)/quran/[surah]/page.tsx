"use client";
import { use } from "react";
import { ReadingView } from "@/components/quran/reading-view";

export default function QuranSurahPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = use(params);
  const surahId = parseInt(surah, 10);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Invalid surah number</h1>
      </div>
    );
  }
  return <ReadingView surahId={surahId} />;
}
