"use client";

import Link from "next/link";
import { ADHKAR_CATEGORIES } from "@/data/adhkar-data";

export default function AdhkarPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Adhkar</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {ADHKAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/adhkar/${cat.id}`}
            className="relative overflow-hidden rounded-xl p-5 transition-transform hover:scale-[1.02]"
            style={{
              backgroundColor: cat.color + "20",
              borderColor: cat.color + "40",
              borderWidth: 1,
            }}
          >
            <p className="font-[UthmanicHafs] text-xl font-bold" dir="rtl">
              {cat.name_arabic}
            </p>
            <p className="mt-1 text-sm font-medium">{cat.name}</p>
            <p className="text-muted-foreground mt-1 text-xs">{cat.count} adhkar</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
