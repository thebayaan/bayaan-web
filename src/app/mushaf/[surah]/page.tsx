import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

interface SurahPageProps {
  params: Promise<{ surah: string }>;
}

export async function generateMetadata({
  params,
}: SurahPageProps): Promise<Metadata> {
  const { surah } = await params;
  return { title: `Surah ${surah}` };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { surah } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold">Surah {surah}</h1>
        <p className="mt-2 text-secondary">Coming soon</p>
      </Card>
    </main>
  );
}
