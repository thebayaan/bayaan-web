'use client';

import { RewayatCard } from "./RewayatCard";
import type { Reciter } from "@/types/reciter";

interface RewayatGridProps {
  reciter: Reciter;
}

export function RewayatGrid({ reciter }: RewayatGridProps) {
  if (reciter.rewayat.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--color-hint)" }}>
          No rewayat available for this reciter.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--color-label)" }}
        >
          Available Rewayat
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--color-hint)" }}
        >
          {reciter.rewayat.length} reading{reciter.rewayat.length === 1 ? "" : "s"} available
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {reciter.rewayat.map((rewayat) => (
          <RewayatCard
            key={rewayat.id}
            rewayat={rewayat}
            reciter={reciter}
          />
        ))}
      </div>
    </div>
  );
}