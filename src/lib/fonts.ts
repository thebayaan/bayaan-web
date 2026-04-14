import localFont from "next/font/local";

export const manrope = localFont({
  src: [
    { path: "../../public/fonts/Manrope-ExtraLight.ttf", weight: "200" },
    { path: "../../public/fonts/Manrope-Light.ttf", weight: "300" },
    { path: "../../public/fonts/Manrope-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Manrope-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/Manrope-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/Manrope-Bold.ttf", weight: "700" },
    { path: "../../public/fonts/Manrope-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const surahNames = localFont({
  src: "../../public/fonts/surah_names.ttf",
  variable: "--font-surah-names",
  display: "swap",
});
