import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Publicly readable surfaces — crawlers and unauthenticated visitors
// can hit these so social previews, SEO, and share links work. Any
// mutation still goes through an authenticated API route.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/quran(.*)",
  "/api/bayaan(.*)",
  "/quran(.*)",
  "/reciter(.*)",
  "/adhkar(.*)",
  "/search(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image(.*)",
  "/apple-icon(.*)",
  "/icon(.*)",
  "/.well-known(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
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
