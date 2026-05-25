# Contributing to Bayaan Web

Thank you for contributing. This guide covers getting the app running locally, following the project's standards, and submitting a pull request.

---

## Table of Contents

1. [Getting started](#getting-started)
2. [Environment variables](#environment-variables)
3. [Development commands](#development-commands)
4. [Code standards](#code-standards)
5. [Testing](#testing)
6. [Architecture](#architecture)
7. [Pull request workflow](#pull-request-workflow)

---

## Getting started

### Prerequisites

- **Node.js 22+** (CI runs against Node 22; older versions may work but aren't validated)
- **No accounts or API keys required** — the dev server boots with zero configuration. Library data (bookmarks, favorites, playlists, notes) is stored in the browser via localStorage.
- **Optional:** a Bayaan API key if you're working on reciter catalogue, audio playback, or timestamp features. See [Backend API for development](#backend-api-for-development) below.

### Clone and install

```bash
git clone https://github.com/thebayaan/bayaan-web.git
cd bayaan-web
npm install
```

The `prepare` script runs Husky automatically on install, setting up the pre-commit hook.

---

## Environment variables

Environment variables are **optional** for local development. Copy the template if you need to override defaults:

```bash
cp .env.example .env.local
```

`.env.example` has inline documentation for every variable. Quick reference:

| Variable                     | Required | Description                                                                                      |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`       | No       | Public base URL for canonical links and OG metadata. Defaults to `http://localhost:3000` in dev. |
| `NEXT_PUBLIC_BAYAAN_API_URL` | No       | Bayaan backend base URL. Defaults to `https://api.thebayaan.com`.                                |
| `BAYAAN_INTERNAL_API_URL`    | No       | Private backend URL used from server routes. Falls back to `NEXT_PUBLIC_BAYAAN_API_URL`.         |
| `BAYAAN_API_KEY`             | No       | Bearer token for the Bayaan API. Required for reciter catalogue and audio.                       |
| `NEXT_PUBLIC_BAYAAN_CDN_URL` | No       | Media CDN base.                                                                                  |
| `NEXT_PUBLIC_APP_VERSION`    | No       | Version shown in settings/about. Falls back to commit SHA.                                       |
| `ANDROID_SHA256_CERT`        | No       | SHA-256 fingerprint for Android App Links (`/.well-known/assetlinks.json`).                      |

### Backend API for development

The Bayaan backend is a separate project. Without `BAYAAN_API_KEY`, these features still work:

- **Quran reader** — text, translations, tafsir (via `/api/quran-v4` proxy to Quran.com)
- **Mushaf** — page rendering with bundled tajweed data (`public/data/qpc-hafs-tajweed.json`)
- **Transliteration** — bundled fallback (`public/data/transliteration.json`)
- **Adhkar** — bundled JSON (`src/data/adhkar.json`)
- **Library** — bookmarks, favorites, playlists, notes (localStorage via `src/stores/library-store.ts`)

These features require a valid `BAYAAN_API_KEY`:

- Reciter catalogue and profiles
- Audio playback and ayah timestamps
- Reciter OG images

For a rate-limited development key, open an issue titled **"Community API key request"**.

---

## Development commands

```bash
# Dev server (Turbopack)
npm run dev                 # → http://localhost:3000

# Build
npm run build
npm run start               # Serve the production build

# Linting and formatting
npm run lint                # ESLint
npm run lint -- --fix
npm run format              # Prettier write
npm run format:check        # Prettier check (what CI runs)

# Type checking
npm run typecheck           # tsc --noEmit

# Tests
npm test                    # Vitest (unit + integration)
npm run test:watch
npm run test:coverage
npm run test:e2e            # Playwright
npm run test:e2e:ui         # Playwright UI mode
```

**Before every commit, run:**

```bash
npm run format && npm run lint && npm run typecheck && npm test
```

All four must pass. Husky + lint-staged already runs Prettier on staged files on commit, but the other checks are yours to run.

---

## Code standards

### TypeScript

- Strict mode. No `any`. Prefer type guards and narrowing over `as` casts.
- Explicitly type function parameters and return types for exported / public functions.
- Use interfaces for props/state shapes.

### React + Next.js 16

- This repo is on **Next.js 16** — APIs, conventions, and file structure may differ from older Next.js knowledge. When in doubt, check the docs bundled in `node_modules/next/dist/docs/`.
- Server Components by default. Add `"use client"` only when needed (interactivity, browser APIs, hooks).
- Data fetching via SWR on the client, `fetch` in Server Components on the server.
- State management via Zustand stores under `src/stores/`.

### Styling

- Tailwind CSS 4 utility-first. Use `class-variance-authority` (`cva`) for variant-driven components.
- Colors go through theme tokens in `globals.css` and `tailwind.config.ts` — don't hardcode hex values in components.
- Components follow shadcn conventions under `src/components/ui/`.

### Naming

- Files: `kebab-case.tsx` (e.g. `reciter-card.tsx`).
- Components: `PascalCase`.
- Directories: `kebab-case`.
- Hooks: `use-kebab-case.ts`, exported as `useCamelCase`.

### Don't

- Don't add features, refactors, or abstractions beyond what the task requires.
- Don't commit `console.log` or commented-out code.
- Don't skip the pre-commit hook (`--no-verify`) unless explicitly asked.

---

## Testing

- **Unit + integration** — Vitest with `@testing-library/react`. Test files live next to source as `*.test.ts(x)` or under `src/__tests__/`.
- **E2E** — Playwright under `e2e/`. These run against a real `next start` server with no external credentials required.
- **Mocking** — MSW for HTTP request interception in tests.

When adding a feature, include at least one Vitest test covering the core behaviour. E2E is reserved for critical user flows (Quran reading, reciter listening, playlist creation).

---

## Architecture

### Key files

| What                         | Where                                     |
| ---------------------------- | ----------------------------------------- |
| Root layout (Theme provider) | `src/app/layout.tsx`                      |
| Middleware                   | `middleware.ts`                           |
| Bayaan API proxy             | `src/app/api/bayaan/[...path]/route.ts`   |
| Quran.com API proxy          | `src/app/api/quran-v4/[...path]/route.ts` |
| Library store (localStorage) | `src/stores/library-store.ts`             |
| Zustand stores               | `src/stores/`                             |
| Shared hooks                 | `src/hooks/`                              |
| UI primitives                | `src/components/ui/`                      |
| Feature components           | `src/components/<feature>/`               |

### Library persistence

There is no sign-in. Bookmarks, favorites, playlists, notes, and highlights are stored in the browser via Zustand's `persist` middleware (`src/stores/library-store.ts` and related stores). Data stays on the device and is not synced to a server.

The Bayaan API proxy (`src/app/api/bayaan/[...path]/route.ts`) forwards catalogue requests using `BAYAAN_API_KEY`. Legacy `/v1/user/...` routes return `410 Gone` with a message pointing callers to local storage.

---

## Pull request workflow

1. **Branch from `main`** (trunk-based; no `develop`):
   ```bash
   git checkout main
   git pull
   git checkout -b feature/your-feature-name
   ```
2. **Branch naming:**
   - `feature/description` — new feature
   - `fix/description` — bug fix
   - `chore/description` — tooling, deps, cleanup
   - `docs/description` — documentation only
3. **Before submitting:**
   ```bash
   npm run format
   npm run lint
   npm run typecheck
   npm test
   ```
4. **Open a PR targeting `main`** with a clear description of what changed and why.
5. **Keep PRs focused** — one feature or fix per PR. Large scope changes are harder to review and more likely to introduce regressions.

### Commit message format

Use conventional commits:

```
feat: add reciter sort order in library
fix: resolve double slash in audio URL generation
chore: bump next to 16.3
docs: document backend API variables
```

Do not include AI tool names or attributions in commit messages.

---

## Security

Do not open public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## Trademark

The "Bayaan" name and logo are trademarks. See [TRADEMARKS.md](TRADEMARKS.md) — forks that distribute under a different name must also rebrand.
