import { NextRequest, NextResponse } from "next/server";

const QURAN_V4_API_URL = "https://api.quran.com/api/v4";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;
  const apiPath = path.join("/");
  const url = new URL(`/api/v4/${apiPath}`, QURAN_V4_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
