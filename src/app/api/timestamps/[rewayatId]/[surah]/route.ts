import { NextRequest, NextResponse } from "next/server";
import type { AyahTimestampsResponse } from "@/types/timestamps";
import type { Rewayat } from "@/types/reciter";
import { fetchTimestampsForRewayat, normalizeTimestampsPayload } from "@/lib/timestamp-fetch";

// Ayah timestamps are mirrored to R2 by the bayaan-backend tooling and
// served from Cloudflare with `Cache-Control: max-age=31536000 immutable`,
// keyed by `{rewayatId}/{paddedSurah}.json`. This matches the
// implementation in the mobile app (`Bayaan/services/timestamps/TimestampFetchService.ts`)
// after PR #278 + PR #18 on bayaan-backend removed the `/v1/timestamps`
// API endpoint. The Next.js route exists purely so the browser can hit
// the CDN without a cross-origin block — the CDN itself does not yet
// emit `Access-Control-Allow-Origin`. Server-to-CDN fetches don't care.
const TIMESTAMPS_CDN_BASE =
  process.env.NEXT_PUBLIC_TIMESTAMPS_CDN_BASE ?? "https://cdn.thebayaan.com/timestamps";

const BAYAAN_API_URL =
  process.env.BAYAAN_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_BAYAAN_API_URL ??
  "https://api.thebayaan.com";
const BAYAAN_API_KEY = process.env.BAYAAN_API_KEY ?? "";

async function fetchRewayat(rewayatId: string): Promise<Rewayat | null> {
  const response = await fetch(`${BAYAAN_API_URL}/v1/rewayat/${rewayatId}`, {
    headers: {
      Authorization: `Bearer ${BAYAAN_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;
  const body = (await response.json()) as { data: Rewayat };
  return body.data ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ rewayatId: string; surah: string }> },
): Promise<NextResponse> {
  const { rewayatId, surah: surahParam } = await params;
  const surah = Number(surahParam);

  if (!rewayatId || !Number.isInteger(surah) || surah < 1 || surah > 114) {
    return NextResponse.json({ error: "Invalid rewayat or surah" }, { status: 400 });
  }

  const padded = String(surah).padStart(3, "0");
  const url = `${TIMESTAMPS_CDN_BASE}/${rewayatId}/${padded}.json`;

  let timestamps: AyahTimestampsResponse["data"]["timestamps"] = [];

  try {
    const upstream = await fetch(url, { next: { revalidate: 86400 } });
    if (upstream.ok) {
      const raw = (await upstream.json()) as unknown;
      timestamps = normalizeTimestampsPayload(surah, raw);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load timestamps";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (timestamps.length === 0) {
    try {
      const rewayat = await fetchRewayat(rewayatId);
      if (!rewayat) {
        return NextResponse.json({ error: "No timestamps available" }, { status: 404 });
      }

      timestamps = await fetchTimestampsForRewayat(rewayat, surah);
      if (timestamps.length === 0) {
        return NextResponse.json({ error: "No timestamps available" }, { status: 404 });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load timestamps";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const payload: AyahTimestampsResponse = {
    data: {
      rewayat_id: rewayatId,
      surah,
      timestamps,
    },
  };
  return NextResponse.json(payload);
}
