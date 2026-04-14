import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" dir="ltr" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
