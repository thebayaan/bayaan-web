import type { Metadata } from "next";
import { ogReciterUrl } from "@/lib/og-urls";
import { ReciterPageClient } from "./reciter-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = `Reciter — ${slug}`;
  return {
    title,
    description: `Recitations of the Holy Qur'an.`,
    openGraph: {
      images: [{ url: ogReciterUrl(slug), width: 1200, height: 630 }],
    },
    twitter: {
      images: [ogReciterUrl(slug)],
    },
  };
}

export default async function ReciterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  return <ReciterPageClient slug={slug} />;
}
