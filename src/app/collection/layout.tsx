import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Collection - Bookmarks & Playlists",
  description: "Manage your personal Quran collection with bookmarked verses, custom playlists, annotations, and highlights. Organize your spiritual journey with personalized collections.",
  keywords: ["Quran Bookmarks", "Islamic Collection", "Verse Bookmarks", "Quran Playlists", "Islamic Library", "Personal Collection", "Verse Annotations", "Quran Highlights", "Islamic Study"],
  openGraph: {
    title: "My Collection - Bookmarks & Playlists",
    description: "Manage your personal Quran collection with bookmarked verses, custom playlists, and annotations.",
    type: "website",
    url: "https://bayaan.app/collection",
    images: [
      {
        url: "/og/collection.png",
        width: 1200,
        height: 630,
        alt: "My Collection - Bookmarks & Playlists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Collection - Bookmarks & Playlists",
    description: "Manage your personal Quran collection with bookmarked verses, custom playlists, and annotations.",
    images: ["/og/collection.png"],
  },
  alternates: {
    canonical: "https://bayaan.app/collection",
  },
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}