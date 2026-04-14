import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const BAYAAN_API_URL =
  process.env.NEXT_PUBLIC_BAYAAN_API_URL ?? "https://api.thebayaan.com";
const BAYAAN_API_KEY = process.env.BAYAAN_API_KEY ?? "";

async function proxyToBayaan(
  request: NextRequest,
  params: { path: string[] },
): Promise<NextResponse> {
  const path = params.path.join("/");
  const url = new URL(`/v1/${path}`, BAYAAN_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // For user-specific routes, use Clerk JWT. For everything else, use API key.
  if (path.startsWith("user/")) {
    const { getToken } = await auth();
    const clerkToken = await getToken();
    if (clerkToken) {
      headers["Authorization"] = `Bearer ${clerkToken}`;
    }
  } else {
    headers["Authorization"] = `Bearer ${BAYAAN_API_KEY}`;
  }

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
