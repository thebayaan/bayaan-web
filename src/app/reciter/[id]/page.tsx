import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mic } from "lucide-react";
import { ReciterHeader } from "@/components/reciters/ReciterHeader";
import { RewayatGrid } from "@/components/reciters/RewayatGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { NavigationHelper } from "@/components/layout/NavigationHelper";
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

  // Breadcrumb items for this reciter page
  const breadcrumbItems = [
    { label: 'Reciters', href: '/reciters', icon: Mic },
    { label: reciter.name, href: `/reciter/${id}` },
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <ReciterHeader reciter={reciter} />

        <div className="mt-8">
          <RewayatGrid reciter={reciter} />
        </div>

        {/* Navigation Suggestions */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-divider)' }}>
          <NavigationHelper showRelated={true} showNext={true} />
        </div>
      </div>
    </main>
  );
}
