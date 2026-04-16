"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDhikrById } from "@/data/adhkar-data";
import { TasbeehCounter } from "@/components/adhkar/tasbeeh-counter";

export default function DhikrPage({
  params,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
}) {
  const { superId, dhikrId } = use(params);
  const dhikr = getDhikrById(dhikrId);
  if (!dhikr || dhikr.categoryId !== superId) notFound();

  return (
    <div className="flex min-h-[70vh] flex-col items-center p-6">
      <Link
        href={`/adhkar/${superId}`}
        className="text-muted-foreground hover:text-foreground self-start text-sm transition-colors"
      >
        &larr; Back
      </Link>
      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
        <p
          className="mb-6 text-center font-[UthmanicHafs] text-2xl leading-relaxed"
          dir="rtl"
          lang="ar"
        >
          {dhikr.arabic}
        </p>
        {dhikr.transliteration ? (
          <p className="text-muted-foreground mb-4 max-w-xl text-center text-xs italic">
            {dhikr.transliteration}
          </p>
        ) : null}
        <p className="text-muted-foreground mb-8 max-w-xl text-center text-sm">
          {dhikr.translation}
        </p>

        <TasbeehCounter dhikrId={dhikr.id} target={dhikr.repeatCount} />

        {dhikr.instruction ? (
          <p className="text-muted-foreground mt-6 max-w-md text-center text-xs">
            {dhikr.instruction}
          </p>
        ) : null}
      </div>
    </div>
  );
}
