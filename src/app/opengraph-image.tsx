import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "Bayaan — Quran Listening & Reading";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadManrope(weight: "Regular" | "Bold" | "ExtraBold"): Promise<ArrayBuffer> {
  const file = await readFile(path.join(process.cwd(), "public/fonts", `Manrope-${weight}.ttf`));
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

const STAR_PATH =
  "M1023 480.093H671.123L996.615 346.416L972.669 288.1L641.861 423.97L892.693 169.029L847.815 124.853L604.737 371.902L739.646 52.616L681.644 28.0892L543.008 356.172V0H479.992V351.951L346.343 26.3902L288.039 50.314L423.88 381.219L168.993 130.307L124.827 175.222L371.823 418.352L52.6049 283.414L28.0833 341.428L356.096 480.093H0V543.123H436.346L381.139 599.247L238.064 748.133L282.943 792.309L418.263 651.314L418.291 651.287L479.992 588.531V667.044V872H543.008V586.778L599.12 641.997L747.975 785.101L792.141 740.213L651.177 604.864L651.149 604.837L588.407 543.123H666.903H1023V480.093Z";

export default async function RootOgImage() {
  const [regular, bold, extraBold] = await Promise.all([
    loadManrope("Regular"),
    loadManrope("Bold"),
    loadManrope("ExtraBold"),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0d0017",
        fontFamily: "Manrope",
        color: "#ffffff",
        padding: "72px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(162,56,255,0.75) 0%, rgba(162,56,255,0) 60%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -260,
          right: -160,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(122,31,212,0.45) 0%, rgba(122,31,212,0) 65%)",
          display: "flex",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg,#b85cff 0%,#7a1fd4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="24" viewBox="0 0 1023 872" fill="none">
              <path d={STAR_PATH} fill="#ffffff" />
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>Bayaan</div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          app.thebayaan.com
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 40,
          marginTop: "auto",
          maxWidth: 900,
          zIndex: 1,
        }}
      >
        <svg width="168" height="143" viewBox="0 0 1023 872" fill="none">
          <path d={STAR_PATH} fill="#ffffff" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
            }}
          >
            Listen &amp; read the Qur&apos;an.
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.35,
              maxWidth: 680,
            }}
          >
            Curated reciters, the full mushaf, and daily adhkar — designed to feel calm and close to
            the text.
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Manrope", data: regular, weight: 400, style: "normal" },
        { name: "Manrope", data: bold, weight: 700, style: "normal" },
        { name: "Manrope", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
