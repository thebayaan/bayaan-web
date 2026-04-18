import "server-only";
import type { Reciter } from "@/types/reciter";

/**
 * Fetch a reciter by slug from the Bayaan backend at request time on the
 * server. Used exclusively from `generateMetadata` so page titles / OG
 * text can show the real reciter name instead of the raw URL slug.
 *
 * Returns `null` when the slug is unknown or the backend is unreachable —
 * callers should fall back to the slug as a display string.
 */
export async function fetchReciterServerSide(slug: string): Promise<Reciter | null> {
  const apiUrl = process.env.NEXT_PUBLIC_BAYAAN_API_URL;
  const apiKey = process.env.BAYAAN_API_KEY;
  if (!apiUrl || !apiKey) return null;

  try {
    const res = await fetch(`${apiUrl}/v1/reciters/${encodeURIComponent(slug)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      // Reciter metadata rarely changes; an hour is fine for OG previews.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Reciter };
    return json.data ?? null;
  } catch {
    return null;
  }
}
