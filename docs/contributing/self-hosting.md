# Self-hosting Bayaan Web

Bayaan is AGPL-3.0-or-later. You are welcome to fork and run your own copy.
This guide covers what you need to do to run the web app end-to-end on your
own infrastructure.

If you only want to develop locally against the public Bayaan API, the
default `.env.example` is enough — skip to the bottom of this document for
that minimal setup.

## What you need

| Component | What it does                                | Required for                                   |
| --------- | ------------------------------------------- | ---------------------------------------------- |
| Web app   | This repository                             | Everything                                     |
| Backend   | Bayaan backend (sibling project, AGPL)      | Reciter catalogue, audio URLs, ayah timestamps |
| CDN       | Object storage for audio and reciter images | Streaming recitations and serving reciter art  |
| Domain    | A domain you control                        | Canonical URLs, OG, universal links            |

The Quran reader, mushaf, adhkar, and library features work without a
backend or CDN — they ship with bundled data and proxy to the public
Quran.com API.

## Step 1: pick a name and brand

The Bayaan name and logo are trademarks. See [TRADEMARKS.md](../../TRADEMARKS.md).
A fork distributed under a different name must rebrand the application,
marketing surfaces, store listings, and any deep-link assertions
(`apple-app-site-association`, `assetlinks.json`).

You may say "based on Bayaan" or "a Bayaan fork" in your project's README
or About page. You may not name your fork "Bayaan", "Bayaan Plus", or
similar.

## Step 2: run a backend

Stand up the Bayaan backend on a Node host of your choice. Note the:

- public URL it will be reachable at (e.g. `https://api.your-domain.example`)
- API key you minted for the web app

## Step 3: configure environment

Copy `.env.example` to `.env.local` for development or set these in your
host's environment for production:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_BAYAAN_API_URL=https://api.your-domain.example
BAYAAN_INTERNAL_API_URL=http://api.your-domain.private:port   # optional
BAYAAN_API_KEY=...
NEXT_PUBLIC_BAYAAN_CDN_URL=https://cdn.your-domain.example    # if media is on a different host
```

If you also ship a companion Android app:

```
ANDROID_SHA256_CERT=...   # SHA-256 fingerprint of your Android signing key
```

## Step 4: configure deep links (optional)

If your fork has a companion mobile app and wants universal-link behaviour:

- **iOS:** edit `public/.well-known/apple-app-site-association` with your
  Apple Developer Team ID and bundle identifier.
- **Android:** the assetlinks file is rendered dynamically from
  `ANDROID_SHA256_CERT`. Just set the env var.

If you do not have a mobile app, remove the iOS file and leave the Android
fingerprint blank. Browsers will treat all Bayaan links as plain web URLs.

## Step 5: deploy

Any Node 22+ host that supports long-running processes works. The Bayaan
maintainer deploys to Railway; Vercel also works out of the box.

```bash
npm install
npm run build
npm run start   # listens on $PORT, defaults to 3000
```

## Minimal: development against the public Bayaan API

You do not need to host your own backend to develop on the web app. The
default `.env.example` points at `api.thebayaan.com`. If you need a
development key for reciter and audio features, open an issue titled
"Community API key request".

```bash
git clone https://github.com/thebayaan/bayaan-web.git
cd bayaan-web
npm install
npm run dev
```

Quran reading, mushaf, adhkar, library, and search work immediately. Reciter
catalogue, audio playback, and timestamps need the community key in your
`.env.local`.

## License obligations

The AGPL requires that anyone interacting with the deployed app over a
network can obtain the source. Practical steps:

- Publish your fork's source publicly (a GitHub mirror is fine).
- Link to your fork's source from a visible place in the app (the About
  page is the conventional spot).
- Preserve the upstream copyright notice and the AGPL text.

See [LICENSE](../../LICENSE) for the full terms.
