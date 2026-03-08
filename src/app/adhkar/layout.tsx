import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adhkar - Islamic Remembrances & Daily Supplications",
  description: "Discover authentic Islamic adhkar and daily supplications. Access morning and evening remembrances, prayer du'as, and spiritual invocations from the Quran and Sunnah.",
  keywords: ["Adhkar", "Islamic Remembrances", "Daily Duas", "Muslim Supplications", "Islamic Prayer", "Dhikr", "Morning Adhkar", "Evening Adhkar", "Islamic Spirituality", "Quran Duas"],
  openGraph: {
    title: "Adhkar - Islamic Remembrances & Daily Supplications",
    description: "Discover authentic Islamic adhkar and daily supplications. Access morning and evening remembrances from the Quran and Sunnah.",
    type: "website",
    url: "https://bayaan.app/adhkar",
    images: [
      {
        url: "/og/adhkar.png",
        width: 1200,
        height: 630,
        alt: "Adhkar - Islamic Remembrances",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adhkar - Islamic Remembrances & Daily Supplications",
    description: "Discover authentic Islamic adhkar and daily supplications. Access morning and evening remembrances from the Quran and Sunnah.",
    images: ["/og/adhkar.png"],
  },
  alternates: {
    canonical: "https://bayaan.app/adhkar",
  },
};

export default function AdhkarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}