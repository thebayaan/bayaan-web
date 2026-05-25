import { NextRequest, NextResponse } from "next/server";

// Use internal Railway URL in production (faster, no public internet hop)
const BAYAAN_API_URL =
  process.env.BAYAAN_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_BAYAAN_API_URL ??
  "https://api.thebayaan.com";
const BAYAAN_API_KEY = process.env.BAYAAN_API_KEY ?? "";

async function proxyToBayaan(
  request: NextRequest,
  params: { path: string[] },
): Promise<NextResponse> {
  const path = params.path.join("/");

  // User library data is stored locally in the browser (localStorage).
  if (path.startsWith("user/")) {
    return NextResponse.json(
      { error: { message: "User library is stored locally in the browser." } },
      { status: 410 },
    );
  }

  const url = new URL(`/v1/${path}`, BAYAAN_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${BAYAAN_API_KEY}`,
  };

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.text();
  }

  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyToBayaan(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyToBayaan(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyToBayaan(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyToBayaan(request, await params);
}
