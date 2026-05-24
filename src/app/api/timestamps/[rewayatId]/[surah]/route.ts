import { NextRequest, NextResponse } from "next/server";
import type { AyahTimestampsResponse } from "@/types/timestamps";
import type { Rewayat } from "@/types/reciter";
import { fetchTimestampsForRewayat } from "@/lib/timestamp-fetch";

const BAYAAN_API_URL =
  process.env.BAYAAN_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_BAYAAN_API_URL ??
  "https://api.thebayaan.com";
const BAYAAN_API_KEY = process.env.BAYAAN_API_KEY ?? "";

async function fetchBayaanTimestamps(
  rewayatId: string,
  surah: number,
): Promise<AyahTimestampsResponse | null> {
  const response = await fetch(`${BAYAAN_API_URL}/v1/timestamps/${rewayatId}/${surah}`, {
    headers: {
      Authorization: `Bearer ${BAYAAN_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Bayaan timestamps error: ${response.status}`);
  }

  return response.json() as Promise<AyahTimestampsResponse>;
}

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

  try {
    const fromBayaan = await fetchBayaanTimestamps(rewayatId, surah);
    if (fromBayaan) {
      return NextResponse.json(fromBayaan);
    }

    const rewayat = await fetchRewayat(rewayatId);
    if (!rewayat) {
      return NextResponse.json({ error: "Rewayat not found" }, { status: 404 });
    }

    const timestamps = await fetchTimestampsForRewayat(rewayat, surah);
    if (timestamps.length === 0) {
      return NextResponse.json({ error: "No timestamps available" }, { status: 404 });
    }

    const payload: AyahTimestampsResponse = {
      data: { rewayat_id: rewayatId, surah, timestamps },
    };
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load timestamps";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
