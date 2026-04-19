import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Reading surfaces and their supporting pages are open to everyone —
// the public flow is "read the Quran and Adhkar without signing in."
// Playback, bookmarks, highlights, library, and the authenticated
// home all sit behind auth.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/quran(.*)",
  "/quran(.*)",
  "/surah(.*)",
  "/mushaf(.*)",
  "/adhkar(.*)",
  "/settings(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image(.*)",
  "/.well-known(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Unauthenticated visitors hitting the app root land on /quran so
  // they can start reading immediately instead of a sign-in wall.
  if (request.nextUrl.pathname === "/") {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/quran", request.url));
    }
    return;
  }
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|\\.well-known|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
