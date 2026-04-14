import type { Metadata } from "next";
import { manrope, surahNames } from "@/lib/fonts";
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
      <body
        className={`${manrope.variable} ${surahNames.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
