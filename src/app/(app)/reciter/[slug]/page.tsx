import type { Metadata } from "next";
import { ogReciterUrl } from "@/lib/og-urls";
import { fetchReciterServerSide } from "@/lib/reciter-server";
import { ReciterPageClient } from "./reciter-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reciter = await fetchReciterServerSide(slug);
  const name = reciter?.name ?? slug;
  // Layout template already appends " — Bayaan" so the bare name is enough.
  const title = name;
  const description = reciter?.bio?.trim()
    ? reciter.bio
    : `Listen to ${name}'s recitations of the Holy Qur'an on Bayaan.`;
  const ogUrl = ogReciterUrl(slug);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 1200, alt: name }],
    },
    twitter: {
      title,
      description,
      images: [ogUrl],
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
