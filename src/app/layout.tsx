import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bayaan — Quran Listening & Reading",
  description: "Listen to and read the Holy Quran with beautiful recitations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
