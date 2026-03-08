import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

interface AdhkarCategoryPageProps {
  params: Promise<{ superId: string }>;
}

export async function generateMetadata({
  params,
}: AdhkarCategoryPageProps): Promise<Metadata> {
  const { superId } = await params;
  return { title: `Adhkar ${superId}` };
}

export default async function AdhkarCategoryPage({
  params,
}: AdhkarCategoryPageProps) {
  const { superId } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold">Adhkar Category {superId}</h1>
        <p className="mt-2 text-secondary">Coming soon</p>
      </Card>
    </main>
  );
}
