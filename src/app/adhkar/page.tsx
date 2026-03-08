import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Adhkar",
};

export default function AdhkarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold">Adhkar</h1>
        <p className="mt-2 text-secondary">Coming soon</p>
      </Card>
    </main>
  );
}
