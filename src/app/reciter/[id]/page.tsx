import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

interface ReciterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ReciterPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Reciter ${id}` };
}

export default async function ReciterPage({ params }: ReciterPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold">Reciter {id}</h1>
        <p className="mt-2 text-secondary">Coming soon</p>
      </Card>
    </main>
  );
}
