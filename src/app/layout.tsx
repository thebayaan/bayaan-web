import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { manrope, surahNames } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.thebayaan.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bayaan — Qur'an Listening & Reading",
    template: "%s — Bayaan",
  },
  description: "Listen to and read the Holy Qur'an with beautiful recitations.",
  openGraph: {
    type: "website",
    siteName: "Bayaan",
    url: SITE_URL,
    title: "Bayaan — Qur'an Listening & Reading",
    description: "Listen to and read the Holy Qur'an with beautiful recitations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bayaan — Qur'an Listening & Reading",
    description: "Listen to and read the Holy Qur'an with beautiful recitations.",
  },
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
