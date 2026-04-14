"use client";

import { use } from "react";
import Link from "next/link";
import { getCategoryById, getDhikrByCategory } from "@/data/adhkar-data";

export default function AdhkarCategoryPage({
  params,
}: {
  params: Promise<{ superId: string }>;
}) {
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
      <h1 className="text-2xl font-bold mb-1">{category.name}</h1>
      <p className="text-lg font-[UthmanicHafs] mb-6" dir="rtl">
        {category.name_arabic}
      </p>
      <div className="space-y-3">
        {dhikrList.map((dhikr) => (
          <Link
            key={dhikr.id}
            href={`/adhkar/${superId}/${dhikr.id}`}
            className="block p-4 rounded-xl bg-[var(--text-alpha-04)] hover:bg-[var(--text-alpha-06)] transition-colors"
          >
            <p
              className="text-lg font-[UthmanicHafs] leading-relaxed"
              dir="rtl"
            >
              {dhikr.text_arabic}
            </p>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {dhikr.translation}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--text-alpha-06)]">
                {dhikr.repetitions}x
              </span>
              <span className="text-xs text-muted-foreground">
                {dhikr.reference}
              </span>
            </div>
          </Link>
        ))}
        {dhikrList.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Full adhkar data coming soon
          </p>
        )}
      </div>
    </div>
  );
}
