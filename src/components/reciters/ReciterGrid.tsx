'use client';

import { ReciterCard } from "./ReciterCard";
import type { Reciter } from "@/types/reciter";

interface ReciterGridProps {
  reciters: Reciter[];
}

export function ReciterGrid({ reciters }: ReciterGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {reciters.map((reciter) => (
        <ReciterCard key={reciter.id} reciter={reciter} />
      ))}
    </div>
  );
}