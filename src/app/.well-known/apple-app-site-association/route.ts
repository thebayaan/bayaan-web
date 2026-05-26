import { NextResponse } from "next/server";
import { branding } from "@/config/branding";

export const runtime = "nodejs";

export function GET(): NextResponse {
  // Only assert universal-link ownership when the fork has shipped a
  // mobile app with a known Team ID + bundle. Otherwise return 404 so
  // iOS does not treat this domain as deep-linking into the upstream
  // Bayaan iOS app.
  if (!branding.iosTeamId || !branding.iosBundleId) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${branding.iosTeamId}.${branding.iosBundleId}`],
            components: [
              { "/": "/quran/*" },
              { "/": "/reciter/*" },
              { "/": "/mushaf/*" },
              { "/": "/adhkar/*" },
            ],
          },
        ],
      },
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
