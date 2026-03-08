import type { Metadata } from "next";
import { ReciterGrid } from "@/components/reciters/ReciterGrid";
import recitersData from "@/data/reciters.json";
import type { Reciter } from "@/types/reciter";

export const metadata: Metadata = {
  title: "Reciters — Bayaan",
  description: "Browse and listen to Quran reciters",
};

export default function RecitersPage() {
  const reciters = recitersData as Reciter[];

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ color: "var(--color-label)" }}
          >
            Reciters
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-hint)" }}
          >
            {reciters.length} reciters available
          </p>
        </div>

        <div className="mt-6">
          <ReciterGrid reciters={reciters} />
        </div>
      </div>
    </main>
  );
}