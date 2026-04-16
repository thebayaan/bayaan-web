# Bayaan Web — Plan 8: Authentication (Clerk)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Clerk authentication to gate the app behind sign-in, create sign-in/sign-up pages, protect routes with middleware, and pass Clerk JWTs to the Bayaan API proxy for user endpoints.

**Architecture:** `@clerk/nextjs` wraps the root layout with `ClerkProvider`. Clerk middleware in `middleware.ts` protects all routes except sign-in, sign-up, and the QuranCDN API proxy. The Bayaan API proxy forwards the user's Clerk session token to authenticate user-specific endpoints. Sign-in/sign-up pages use Clerk's pre-built components.

**Tech Stack:** @clerk/nextjs, Clerk middleware

**Depends on:** Plans 1-7 completed

---

### Task 1: Install Clerk and Create Middleware

**Files:**

- Modify: `package.json` (add @clerk/nextjs)
- Create: `middleware.ts` (project root)
- Modify: `.env.local` (add Clerk keys)

- [ ] **Step 1: Install Clerk**

```bash
npm install @clerk/nextjs
```

- [ ] **Step 2: Add Clerk env vars to .env.local**

Add to `.env.local` (keep existing vars):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Note: Get keys from https://dashboard.clerk.com after creating a Bayaan project. Enable email+password, Google, and Apple sign-in methods.

- [ ] **Step 3: Create Clerk middleware**

Create `middleware.ts` in the project root:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/quran(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- [ ] **Step 4: Run type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: install Clerk and add auth middleware"
```

---

### Task 2: ClerkProvider + Sign-In/Sign-Up Pages

**Files:**

- Modify: `src/app/layout.tsx` (wrap with ClerkProvider)
- Create: `src/app/sign-in/[[...sign-in]]/page.tsx`
- Create: `src/app/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Add ClerkProvider to root layout**

Modify `src/app/layout.tsx` — wrap the `<html>` element with `<ClerkProvider>`:

Add import:

```typescript
import { ClerkProvider } from "@clerk/nextjs";
```

Wrap the return:

```tsx
return (
  <ClerkProvider>
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${manrope.variable} ${surahNames.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  </ClerkProvider>
);
```

- [ ] **Step 2: Create sign-in page**

Create `src/app/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

- [ ] **Step 3: Create sign-up page**

Create `src/app/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

- [ ] **Step 4: Run type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ClerkProvider and sign-in/sign-up pages"
```

---

### Task 3: Pass Clerk Token to Bayaan API Proxy

**Files:**

- Modify: `src/app/api/bayaan/[...path]/route.ts`

- [ ] **Step 1: Update Bayaan API proxy to forward Clerk token for user routes**

Modify `src/app/api/bayaan/[...path]/route.ts` to pass the Clerk session token to user endpoints:

Add import at top:

```typescript
import { auth } from "@clerk/nextjs/server";
```

Update the `proxyToBayaan` function to get the Clerk token and forward it for `/user/*` routes:

```typescript
async function proxyToBayaan(
  request: NextRequest,
  params: { path: string[] },
): Promise<NextResponse> {
  const path = params.path.join("/");
  const url = new URL(`/v1/${path}`, BAYAAN_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    Authorization: `Bearer ${BAYAAN_API_KEY}`,
    "Content-Type": "application/json",
  };

  // For user-specific routes, forward the Clerk session token
  if (path.startsWith("user/") || path.startsWith("webhooks/")) {
    const { getToken } = await auth();
    const clerkToken = await getToken();
    if (clerkToken) {
      headers["X-Clerk-Token"] = clerkToken;
    }
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.text();
  }

  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
```

Note: The backend's `userAuth` middleware reads from the `Authorization` header. We need to update the proxy to swap the auth header for user routes. Here's the corrected version:

```typescript
async function proxyToBayaan(
  request: NextRequest,
  params: { path: string[] },
): Promise<NextResponse> {
  const path = params.path.join("/");
  const url = new URL(`/v1/${path}`, BAYAAN_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // For user-specific routes, use Clerk JWT. For everything else, use API key.
  if (path.startsWith("user/")) {
    const { getToken } = await auth();
    const clerkToken = await getToken();
    if (clerkToken) {
      headers["Authorization"] = `Bearer ${clerkToken}`;
    }
  } else {
    headers["Authorization"] = `Bearer ${BAYAAN_API_KEY}`;
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.text();
  }

  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
```

This way:

- `/api/bayaan/reciters` → uses `BAYAAN_API_KEY` (API key auth, existing behavior)
- `/api/bayaan/user/bookmarks` → uses Clerk JWT (user auth)

- [ ] **Step 2: Run type check and tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: forward Clerk JWT to Bayaan API for user routes"
```

---

### Task 4: Add User Button to Sidebar

**Files:**

- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Add UserButton to sidebar**

Add the Clerk `UserButton` to the sidebar for account management. Modify `src/components/layout/sidebar.tsx`:

Add import:

```typescript
import { UserButton } from "@clerk/nextjs";
```

Add the UserButton in the `mt-auto` section, before the Settings nav item:

```tsx
<div className="mt-auto space-y-2 px-2 pb-4">
  <div className="flex items-center gap-3 px-3 py-2">
    <UserButton
      appearance={{
        elements: { avatarBox: "w-7 h-7" },
      }}
    />
    <span className="text-muted-foreground hidden text-sm lg:inline">Account</span>
  </div>
  <SidebarNavItem href="/settings" icon={SettingsIcon} label="Settings" />
</div>
```

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Clerk UserButton to sidebar for account management"
```

---

## Completion Criteria

1. Unauthenticated users are redirected to `/sign-in`
2. Sign-in page shows Clerk UI with configured auth methods
3. Sign-up page shows Clerk UI
4. After sign-in, user is redirected to home page
5. Sidebar shows Clerk UserButton with avatar
6. Bayaan API proxy forwards Clerk JWT for `/user/*` routes
7. QuranCDN API proxy remains public (no auth required)
8. `npx tsc --noEmit` clean, `npm test` all green
9. All committed on `feat/bayaan-web-design`
