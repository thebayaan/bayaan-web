import { NextRequest, NextResponse } from "next/server";
import type { AyahTimestampsResponse } from "@/types/timestamps";

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

  let upstream: Response;
  try {
    upstream = await fetch(url, { next: { revalidate: 86400 } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load timestamps";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (upstream.status === 404) {
    return NextResponse.json({ error: "No timestamps available" }, { status: 404 });
  }
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Timestamps CDN error: ${upstream.status}` },
      { status: 502 },
    );
  }

  const timestamps = (await upstream.json()) as unknown;
  if (!Array.isArray(timestamps)) {
    return NextResponse.json({ error: "Malformed timestamps payload" }, { status: 502 });
  }

  const payload: AyahTimestampsResponse = {
    data: {
      rewayat_id: rewayatId,
      surah,
      timestamps: timestamps as AyahTimestampsResponse["data"]["timestamps"],
    },
  };
  return NextResponse.json(payload);
}
