import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Surah } from "@/types/quran";

interface SurahCardProps {
  surah: Surah;
}

export function SurahCard({ surah }: SurahCardProps) {
  return (
    <Link href={`/mushaf/${surah.id}`}>
      <Card className="group p-4 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-card-border)] text-sm font-semibold">
              {surah.id}
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--color-label)]">
                {surah.name}
              </h3>
              <p className="text-sm text-[color:var(--color-hint)]">
                {surah.translated_name_english}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-[color:var(--color-label)]">
              {surah.name_arabic}
            </p>
            <p className="text-sm text-[color:var(--color-hint)]">
              {surah.verses_count} verses · {surah.revelation_place}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}