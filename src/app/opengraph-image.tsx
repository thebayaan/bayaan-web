import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "Bayaan — Quran Listening & Reading";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadManrope(weight: "Regular" | "Bold"): Promise<ArrayBuffer> {
  const file = await readFile(path.join(process.cwd(), "public/fonts", `Manrope-${weight}.ttf`));
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

export default async function RootOgImage() {
  const [regular, bold] = await Promise.all([loadManrope("Regular"), loadManrope("Bold")]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#050b10",
        color: "#e8e8e8",
        fontFamily: "Manrope",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 140, fontWeight: 700, letterSpacing: -2 }}>Bayaan</div>
      <div style={{ fontSize: 36, marginTop: 24, color: "#B0B0B0", textAlign: "center" }}>
        Listen to and read the Holy Qur&apos;an
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Manrope", data: regular, weight: 400, style: "normal" },
        { name: "Manrope", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
