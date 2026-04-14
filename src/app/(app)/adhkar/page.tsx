"use client";

import Link from "next/link";
import { ADHKAR_CATEGORIES } from "@/data/adhkar-data";

export default function AdhkarPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Adhkar</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            <p className="text-xl font-bold font-[UthmanicHafs]" dir="rtl">
              {cat.name_arabic}
            </p>
            <p className="text-sm font-medium mt-1">{cat.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {cat.count} adhkar
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
