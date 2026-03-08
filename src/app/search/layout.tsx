import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - Find Quran Verses, Reciters & Adhkar",
  description: "Search across the Holy Quran verses, Surahs, renowned reciters, and authentic adhkar collections. Find specific verses, topics, or Islamic content instantly.",
  keywords: ["Quran Search", "Search Verses", "Find Quran", "Search Reciters", "Search Adhkar", "Islamic Search", "Quran Finder", "Verse Lookup", "Islamic Content Search"],
  openGraph: {
    title: "Search - Find Quran Verses, Reciters & Adhkar",
    description: "Search across the Holy Quran verses, Surahs, renowned reciters, and authentic adhkar collections.",
    type: "website",
    url: "https://bayaan.app/search",
    images: [
      {
        url: "/og/search.png",
        width: 1200,
        height: 630,
        alt: "Search Quran & Islamic Content",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Search - Find Quran Verses, Reciters & Adhkar",
    description: "Search across the Holy Quran verses, Surahs, renowned reciters, and authentic adhkar collections.",
    images: ["/og/search.png"],
  },
  alternates: {
    canonical: "https://bayaan.app/search",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}