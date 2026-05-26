import { NextResponse } from "next/server";
import { branding } from "@/config/branding";

export const runtime = "nodejs";

export function GET(): NextResponse {
  const sha = process.env.ANDROID_SHA256_CERT;
  // Only assert deep-link ownership when both the package name and the
  // signing-cert fingerprint are configured. Without these, return 404
  // so Android does not treat this domain as deep-linking into the
  // upstream Bayaan Android app.
  if (!branding.androidPackage || !sha) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: branding.androidPackage,
          sha256_cert_fingerprints: [sha],
        },
      },
    ],
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
