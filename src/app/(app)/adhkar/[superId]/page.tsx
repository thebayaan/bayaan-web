"use client";

import { use } from "react";
import Link from "next/link";
import { getCategoryById, getDhikrByCategory } from "@/data/adhkar-data";

export default function AdhkarCategoryPage({ params }: { params: Promise<{ superId: string }> }) {
  const { superId } = use(params);
  const category = getCategoryById(superId);
  const dhikrList = getDhikrByCategory(superId);

  if (!category) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold">{category.name}</h1>
      <p className="mb-6 font-[UthmanicHafs] text-lg" dir="rtl">
        {category.name_arabic}
      </p>
      <div className="space-y-3">
        {dhikrList.map((dhikr) => (
          <Link
            key={dhikr.id}
            href={`/adhkar/${superId}/${dhikr.id}`}
            className="block rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
          >
            <p className="font-[UthmanicHafs] text-lg leading-relaxed" dir="rtl">
              {dhikr.text_arabic}
            </p>
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{dhikr.translation}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-[var(--text-alpha-06)] px-2 py-0.5 text-xs">
                {dhikr.repetitions}x
              </span>
              <span className="text-muted-foreground text-xs">{dhikr.reference}</span>
            </div>
          </Link>
        ))}
        {dhikrList.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">Full adhkar data coming soon</p>
        )}
      </div>
    </div>
  );
}
