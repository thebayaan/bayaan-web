import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Use internal Railway URL in production (faster, no public internet hop)
const BAYAAN_API_URL =
  process.env.BAYAAN_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_BAYAAN_API_URL ??
  "https://api.thebayaan.com";
const BAYAAN_API_KEY = process.env.BAYAAN_API_KEY ?? "";
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

async function proxyToBayaan(
  request: NextRequest,
  params: { path: string[] },
): Promise<NextResponse> {
  const path = params.path.join("/");

  // User-specific routes require a signed-in user. On deployments without
  // Clerk configured there's no way to authenticate these, so return 401.
  if (path.startsWith("user/") && !CLERK_ENABLED) {
    return NextResponse.json({ error: "Auth not configured on this deployment" }, { status: 401 });
  }

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
