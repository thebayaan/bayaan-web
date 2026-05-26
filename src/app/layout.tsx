import type { Metadata } from "next";
import { manrope, surahNames } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { branding } from "@/config/branding";
import "./globals.css";

const titleDefault = `${branding.appName} - ${branding.appTagline}`;
const description = "Listen to and read the Holy Qur'an with beautiful recitations.";

// Only emit the apple-itunes-app smart-banner when the fork has actually
// shipped a mobile app — otherwise forks would banner their users into the
// upstream Bayaan iOS app.
const other: Record<string, string> = {};
if (branding.iosAppId) {
  other["apple-itunes-app"] =
    `app-id=${branding.iosAppId}, app-argument=${branding.iosAppUrl ?? branding.siteUrl}`;
}

export const metadata: Metadata = {
  metadataBase: new URL(branding.siteUrl),
  title: {
    default: titleDefault,
    template: `%s | ${branding.appName}`,
  },
  description,
  openGraph: {
    type: "website",
    siteName: branding.appName,
    url: branding.siteUrl,
    title: titleDefault,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: titleDefault,
    description,
  },
  other,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${manrope.variable} ${surahNames.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
