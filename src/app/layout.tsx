import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "@/styles/globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bayaan - Premium Quran Experience",
    template: "%s · Bayaan",
  },
  description: "A premium Quran listening experience with beautiful reciters, translations, and adhkar collection",
  keywords: ["Quran", "Islamic", "audio", "recitation", "tilawah", "Adhkar", "Muslim", "Prayer", "Dua"],
  applicationName: "Bayaan",
  authors: [{ name: "Bayaan Team" }],
  creator: "Bayaan",
  publisher: "Bayaan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  metadataBase: new URL("https://bayaan.app"),
  alternates: {
    canonical: "https://bayaan.app",
  },
  openGraph: {
    type: "website",
    siteName: "Bayaan",
    title: "Bayaan - Premium Quran Experience",
    description: "A premium Quran listening experience with beautiful reciters, translations, and adhkar collection",
    url: "https://bayaan.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bayaan - Premium Quran Experience",
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "Bayaan App",
      },
    ],
    locale: "en_US",
    countryName: "Global",
  },
  twitter: {
    card: "summary_large_image",
    site: "@BayaanApp",
    creator: "@BayaanApp",
    title: "Bayaan - Premium Quran Experience",
    description: "A premium Quran listening experience with beautiful reciters, translations, and adhkar collection",
    images: ["/twitter-card.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bayaan",
    startupImage: [
      {
        url: "/splash/apple-splash-2048-2732.jpg",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1668-2224.jpg",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1536-2048.jpg",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1125-2436.jpg",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1242-2208.jpg",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-750-1334.jpg",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-828-1792.jpg",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#0a0a0a" },
    ],
  },
  other: {
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-config": "/browserconfig.xml",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-verification-code", // TODO: Add actual verification codes
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
    other: {
      "msvalidate.01": "bing-verification-code",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-[family-name:var(--font-manrope)] antialiased">
{/* StructuredData temporarily removed for build issues */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
          style={{
            backgroundColor: "var(--color-text)",
            color: "var(--color-background)",
          }}
        >
          Skip to content
        </a>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
