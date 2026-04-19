import { NextRequest, NextResponse } from "next/server";

const BAYAAN_API_URL =
  process.env.BAYAAN_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_BAYAAN_API_URL ??
  "https://api.thebayaan.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;
  const target = new URL(`/og/${path.join("/")}`, BAYAAN_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const upstream = await fetch(target.toString());
  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
