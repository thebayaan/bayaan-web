import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { manrope, surahNames } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.thebayaan.com";

// When the fork is built without a Clerk dev instance, skip ClerkProvider
// so the app boots. Auth-gated features fall back to a signed-out state
// via the wrapper in @/lib/auth.
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bayaan - Listen to the Qur'an",
    template: "%s | Bayaan",
  },
  description: "Listen to and read the Holy Qur'an with beautiful recitations.",
  openGraph: {
    type: "website",
    siteName: "Bayaan",
    url: SITE_URL,
    title: "Bayaan - Listen to the Qur'an",
    description: "Listen to and read the Holy Qur'an with beautiful recitations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bayaan - Listen to the Qur'an",
    description: "Listen to and read the Holy Qur'an with beautiful recitations.",
  },
  other: {
    "apple-itunes-app": "app-id=6648769980, app-argument=https://app.thebayaan.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tree = (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${manrope.variable} ${surahNames.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
  return CLERK_ENABLED ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
