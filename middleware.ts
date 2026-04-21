import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

// When the fork has no Clerk keys configured, don't wire up Clerk's
// middleware at all — let every request through. Auth-gated features
// handle their own signed-out state via the wrapper in @/lib/auth.
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default CLERK_ENABLED
  ? clerkMiddleware(async (auth, request) => {
      if (!isPublicRoute(request)) {
        await auth.protect();
      }
    })
  : function passthroughMiddleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|\\.well-known|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
