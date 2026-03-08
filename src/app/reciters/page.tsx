import type { Metadata } from "next";
import { ReciterGrid } from "@/components/reciters/ReciterGrid";
import recitersData from "@/data/reciters.json";
import type { Reciter } from "@/types/reciter";

export const metadata: Metadata = {
  title: "Quran Reciters - Beautiful Audio Recitations",
  description: "Discover and listen to beautiful Quran recitations from renowned reciters worldwide. Choose from multiple qira'at styles and experience the divine beauty of Quranic tilawah.",
  keywords: ["Quran Reciters", "Qari", "Tilawah", "Recitation", "Audio Quran", "Islamic Audio", "Qira'at", "Beautiful Recitation", "Quran Audio", "Islamic Scholars"],
  openGraph: {
    title: "Quran Reciters - Beautiful Audio Recitations",
    description: "Discover and listen to beautiful Quran recitations from renowned reciters worldwide. Multiple qira'at styles available.",
    type: "website",
    url: "https://bayaan.app/reciters",
    images: [
      {
        url: "/og/reciters.png",
        width: 1200,
        height: 630,
        alt: "Quran Reciters - Audio Recitations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quran Reciters - Beautiful Audio Recitations",
    description: "Discover and listen to beautiful Quran recitations from renowned reciters worldwide. Multiple qira'at styles available.",
    images: ["/og/reciters.png"],
  },
  alternates: {
    canonical: "https://bayaan.app/reciters",
  },
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