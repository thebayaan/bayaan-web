"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

type AnyFn<A extends unknown[], R> = (...args: A) => R;

/**
 * Wrap an action so it runs immediately for signed-in users and
 * redirects unsigned-in users to sign-in with a return URL. The
 * caller keeps the same call shape, so gating is a drop-in swap at
 * the event-handler boundary.
 */
export function useAuthGate(): <A extends unknown[], R>(action: AnyFn<A, R>) => AnyFn<A, R | void> {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();

  return useCallback(
    <A extends unknown[], R>(action: AnyFn<A, R>) =>
      (...args: A): R | void => {
        // Clerk hasn't hydrated yet — swallow the click instead of
        // making a decision we'd have to undo.
        if (!isLoaded) return;
        if (isSignedIn) return action(...args);
        const redirect = pathname ?? "/";
        const url = `/sign-in?redirect_url=${encodeURIComponent(redirect)}`;
        if (typeof window !== "undefined") {
          window.location.assign(url);
        }
      },
    [isSignedIn, isLoaded, pathname],
  );
}
