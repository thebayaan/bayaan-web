import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET(): NextResponse {
  const sha = process.env.ANDROID_SHA256_CERT ?? "REPLACE_WITH_ACTUAL_SHA256_FINGERPRINT";
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.bayaan.app",
          sha256_cert_fingerprints: [sha],
        },
      },
    ],
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
