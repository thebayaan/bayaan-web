import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { manrope, surahNames } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bayaan — Quran Listening & Reading",
  description: "Listen to and read the Holy Quran with beautiful recitations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" dir="ltr" suppressHydrationWarning>
        <body className={`${manrope.variable} ${surahNames.variable} font-sans antialiased`}>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
