import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #b85cff 0%, #a238ff 40%, #7a1fd4 100%)",
        borderRadius: 40,
      }}
    >
      <svg
        width="112"
        height="96"
        viewBox="0 0 1023 872"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1023 480.093H671.123L996.615 346.416L972.669 288.1L641.861 423.97L892.693 169.029L847.815 124.853L604.737 371.902L739.646 52.616L681.644 28.0892L543.008 356.172V0H479.992V351.951L346.343 26.3902L288.039 50.314L423.88 381.219L168.993 130.307L124.827 175.222L371.823 418.352L52.6049 283.414L28.0833 341.428L356.096 480.093H0V543.123H436.346L381.139 599.247L238.064 748.133L282.943 792.309L418.263 651.314L418.291 651.287L479.992 588.531V667.044V872H543.008V586.778L599.12 641.997L747.975 785.101L792.141 740.213L651.177 604.864L651.149 604.837L588.407 543.123H666.903H1023V480.093Z"
          fill="#ffffff"
        />
      </svg>
    </div>,
    { ...size },
  );
}
