import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET(): NextResponse {
  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: ["S4W5Q2L53W.com.bayaan.app"],
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
