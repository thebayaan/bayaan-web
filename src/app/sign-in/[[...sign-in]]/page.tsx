import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignInPage() {
  if (!CLERK_ENABLED) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-foreground text-2xl font-semibold">Sign-in not configured</h1>
          <p className="text-muted-foreground text-sm">
            This deployment is running without a Clerk instance, so sign-in isn&apos;t available.
            Library features that need a signed-in user (bookmarks, favorites, notes, playlists) are
            disabled.
          </p>
          <Link
            href="/"
            className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong duration-fast ease-standard inline-block rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          >
            Continue to Qur&apos;an
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
