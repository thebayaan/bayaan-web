# Deployment

How to build and deploy the Bayaan web app.

## Production build

```bash
npm install
npm run build
npm run start
```

`npm run build` produces a Next.js 16 production bundle. `npm run start`
serves it on `$PORT` (default `3000`).

## Hosts

The repository is tested on:

| Host    | Notes                                                                            |
| ------- | -------------------------------------------------------------------------------- |
| Railway | Primary host for `app.thebayaan.com`. Uses `npm run build` then `npm run start`. |
| Vercel  | Works out of the box; the framework preset auto-detects Next.js.                 |

Any Node 22+ host with a long-running process model works. We do not require
a specific edge runtime; OG image generation and middleware run on Node.

## Environment variables

All variables are documented in `.env.example`. For a public deployment you
probably want:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_BAYAAN_API_URL=https://your-backend.example
BAYAAN_INTERNAL_API_URL=http://your-backend.private:port    # optional
BAYAAN_API_KEY=...                                          # if you serve reciter data
NEXT_PUBLIC_BAYAAN_CDN_URL=https://your-cdn.example         # if media is on a separate host
ANDROID_SHA256_CERT=...                                     # if you ship a companion Android app
```

For self-hosting against your own backend, see
[../contributing/self-hosting.md](../contributing/self-hosting.md).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and
every PR:

1. **verify** — `npm run lint`, `npm run typecheck`, `npm run format:check`,
   `npm run test:coverage`. Coverage artifact is uploaded.
2. **build** — `npm run build` against a placeholder API URL, then a smoke
   curl of `/`, `/quran`, `/favicon.ico`.
3. **e2e** — `npx playwright install --with-deps chromium && npm run test:e2e`.
   The Playwright report uploads on failure.

CI runs on Node 22 with `NODE_OPTIONS=--max-old-space-size=4096` where the
TypeScript checker needs the heap.

## Releases

- Releases are tagged `vX.Y.Z` following semver.
- The [CHANGELOG.md](../../CHANGELOG.md) is the canonical history.
- We use Conventional Commits (`feat:`, `fix:`, `chore:`, etc.). Releases
  are automated via [`release-please`](../../.github/workflows/release-please.yml).

## Universal links

For deep-linking from the Bayaan iOS or Android app into the web app:

Both endpoints are dynamic App Router routes, not static files in `public/`.

- iOS: edit `src/app/.well-known/apple-app-site-association/route.ts` with
  your Team ID and bundle. The route serves `/.well-known/apple-app-site-association`.
- Android: set `ANDROID_SHA256_CERT` to your app's signing fingerprint; the
  route at `src/app/.well-known/assetlinks.json/route.ts` renders
  `/.well-known/assetlinks.json` dynamically.

If you are running a fork that does not have a companion mobile app, leave
both blank.
