import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import type { Surah } from "@/types/quran";

interface SurahHeaderProps {
  surah: Surah;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <Card className="p-6 text-center">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--color-label)]">
            {surah.name_arabic}
          </h1>
          <p className="mt-2 text-xl font-medium text-[color:var(--color-label)]">
            {surah.name}
          </p>
          <p className="text-base text-[color:var(--color-hint)]">
            {surah.translated_name_english}
          </p>
        </div>

        <Divider />

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-[color:var(--color-hint)]">Verses</p>
            <p className="font-semibold text-[color:var(--color-label)]">
              {surah.verses_count}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[color:var(--color-hint)]">Revelation</p>
            <p className="font-semibold text-[color:var(--color-label)]">
              {surah.revelation_place}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[color:var(--color-hint)]">Order</p>
            <p className="font-semibold text-[color:var(--color-label)]">
              {surah.revelation_order}
            </p>
          </div>
        </div>

        {surah.bismillah_pre && (
          <>
            <Divider />
            <p className="text-2xl font-normal text-[color:var(--color-label)]" dir="rtl">
              بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
            </p>
          </>
        )}
      </div>
    </Card>
  );
}