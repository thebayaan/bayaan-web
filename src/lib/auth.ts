"use client";

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";

/**
 * Whether a Clerk instance is configured for this deployment.
 *
 * When unset (i.e. the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` env var is blank
 * or missing), the app boots without a ClerkProvider and all auth surfaces
 * fall back to an unauthenticated "guest" state. Library features that
 * require a signed-in user (bookmarks, favorites, notes, playlists) will
 * render sign-in CTAs that no-op, and sign-in / sign-up pages display a
 * "sign-in not configured" notice.
 *
 * Inlined at build time by Next.js — safe to branch on in module scope
 * and in hook bodies.
 */
export const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const GUEST_AUTH = {
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  sessionId: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  has: () => false,
  getToken: async () => null,
  signOut: async () => {},
} as const;

const GUEST_USER = {
  isLoaded: true,
  isSignedIn: false,
  user: null,
} as const;

/**
 * Thin wrapper around Clerk's `useAuth` that returns a stable guest
 * fallback when Clerk isn't configured. Callers get the same shape
 * regardless of auth availability, so feature code doesn't need to
 * branch on `CLERK_ENABLED` itself.
 */
export function useAuth(): ReturnType<typeof useClerkAuth> {
  // CLERK_ENABLED is a build-time constant, so this early return either
  // always fires or never fires for a given build — the order of real
  // hook calls below is stable across renders. Safe to suppress
  // rules-of-hooks here.
  if (!CLERK_ENABLED) {
    return GUEST_AUTH as unknown as ReturnType<typeof useClerkAuth>;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkAuth();
}

export function useUser(): ReturnType<typeof useClerkUser> {
  if (!CLERK_ENABLED) {
    return GUEST_USER as unknown as ReturnType<typeof useClerkUser>;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkUser();
}
