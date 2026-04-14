"use client";

import { use, useState } from "react";
import { getDhikrByCategory } from "@/data/adhkar-data";

export default function DhikrPage({
  params,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
}) {
  const { superId, dhikrId } = use(params);
  const dhikrList = getDhikrByCategory(superId);
  const dhikr = dhikrList.find((d) => d.id === dhikrId);
  const [count, setCount] = useState(0);

  if (!dhikr) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dhikr not found</h1>
      </div>
    );
  }

  const target = dhikr.repetitions;
  const progress = Math.min(count / target, 1);
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <p
        className="text-2xl font-[UthmanicHafs] leading-relaxed text-center mb-8 max-w-lg"
        dir="rtl"
      >
        {dhikr.text_arabic}
      </p>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
        {dhikr.translation}
      </p>

      {/* Tasbeeh Counter */}
      <button
        onClick={() => setCount((c) => c + 1)}
        className="relative w-40 h-40 rounded-full flex items-center justify-center transition-transform active:scale-95"
      >
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 128 128"
        >
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="var(--text-alpha-06)"
            strokeWidth="4"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="text-center">
          <p className="text-3xl font-bold">{count}</p>
          <p className="text-xs text-muted-foreground">/ {target}</p>
        </div>
      </button>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setCount(0)}
          className="px-4 py-2 text-sm rounded-lg bg-[var(--text-alpha-06)] hover:bg-[var(--text-alpha-10)] transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">{dhikr.reference}</p>
    </div>
  );
}
