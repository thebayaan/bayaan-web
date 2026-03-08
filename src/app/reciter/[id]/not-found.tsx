import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserX, ArrowLeft } from "lucide-react";

export default function ReciterNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="p-8 text-center max-w-md">
        <div
          className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          <UserX
            size={24}
            style={{ color: "var(--color-icon)" }}
            strokeWidth={1.5}
          />
        </div>

        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-label)" }}
        >
          Reciter Not Found
        </h1>

        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-hint)" }}
        >
          The reciter you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>

        <div className="space-y-3">
          <Link href="/reciters" className="block w-full">
            <Button className="w-full">
              Browse All Reciters
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} strokeWidth={1.5} />
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}