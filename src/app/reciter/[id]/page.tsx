import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReciterHeader } from "@/components/reciters/ReciterHeader";
import { RewayatGrid } from "@/components/reciters/RewayatGrid";
import recitersData from "@/data/reciters.json";
import type { Reciter } from "@/types/reciter";

interface ReciterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ReciterPageProps): Promise<Metadata> {
  const { id } = await params;
  const reciters = recitersData as Reciter[];
  const reciter = reciters.find(r => r.id === id);

  if (!reciter) {
    return { title: "Reciter not found — Bayaan" };
  }

  return {
    title: `${reciter.name} — Bayaan`,
    description: `Listen to Quran recitation by ${reciter.name}. ${reciter.rewayat.length} rewayat available.`,
  };
}

export default async function ReciterPage({ params }: ReciterPageProps) {
  const { id } = await params;
  const reciters = recitersData as Reciter[];
  const reciter = reciters.find(r => r.id === id);

  if (!reciter) {
    notFound();
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <ReciterHeader reciter={reciter} />

        <div className="mt-8">
          <RewayatGrid reciter={reciter} />
        </div>
      </div>
    </main>
  );
}
