# Contributing to Bayaan Web

Thank you for contributing. This guide covers getting the app running locally,
following the project's standards, and submitting a pull request that reviewers
can land quickly.

If you are new to the project, please also read:

- [Code of Conduct](CODE_OF_CONDUCT.md) — how we behave with each other.
- [Governance](GOVERNANCE.md) — how decisions get made and who makes them.
- [Trademark policy](TRADEMARKS.md) — what forks may and may not do with the
  Bayaan name and marks.
- [Security policy](SECURITY.md) — how to report vulnerabilities privately.

---

## Table of Contents

1. [Getting started](#getting-started)
2. [Environment variables](#environment-variables)
3. [Development commands](#development-commands)
4. [Code standards](#code-standards)
5. [Design system](#design-system)
6. [Testing](#testing)
7. [AI-assisted development](#ai-assisted-development)
8. [Architecture navigation](#architecture-navigation)
9. [Pull request workflow](#pull-request-workflow)
10. [Architectural RFCs](#architectural-rfcs)
11. [Self-hosting and forks](#self-hosting-and-forks)
12. [Community and communication](#community-and-communication)
13. [First contributions](#first-contributions)

---

## Getting started

### Prerequisites

- **Node.js 22+** (CI runs against Node 22; pinned via `.nvmrc` and the
  `engines` field in `package.json`). Older versions may work but are not
  validated.
- **No accounts or API keys required** — the dev server boots with zero
  configuration. Library data (bookmarks, favorites, playlists, notes) is
  stored in the browser via `localStorage`.
- **Optional:** a Bayaan API key if you are working on the reciter catalogue,
  audio playback, or timestamp features. See
  [Backend API for development](#backend-api-for-development) below.

### Clone and install

```bash
git clone https://github.com/thebayaan/bayaan-web.git
cd bayaan-web
npm install
```

The `prepare` script runs Husky automatically on install, setting up the
pre-commit hook (Prettier + ESLint on staged files via `lint-staged`).

### Run it

```bash
npm run dev
```

Open `http://localhost:3000`. The Quran reader, mushaf, adhkar, and library
features work immediately with bundled data.

---

## Environment variables

Environment variables are **optional** for local development. Copy the template
if you need to override defaults:

```bash
cp .env.example .env.local
```

`.env.example` has inline documentation for every variable. Quick reference:

| Variable                     | Required | Description                                                                                      |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`       | No       | Public base URL for canonical links and OG metadata. Defaults to `http://localhost:3000` in dev. |
| `NEXT_PUBLIC_BAYAAN_API_URL` | No       | Bayaan backend base URL. Defaults to `https://api.thebayaan.com`.                                |
| `BAYAAN_INTERNAL_API_URL`    | No       | Private backend URL used from server routes. Falls back to `NEXT_PUBLIC_BAYAAN_API_URL`.         |
| `BAYAAN_API_KEY`             | No       | Bearer token for the Bayaan API. Required for reciter catalogue and audio playback.              |
| `NEXT_PUBLIC_BAYAAN_CDN_URL` | No       | Media CDN base. Defaults to the public Bayaan CDN.                                               |
| `NEXT_PUBLIC_APP_VERSION`    | No       | Version shown in settings/about. Falls back to commit SHA.                                       |
| `ANDROID_SHA256_CERT`        | Submit   | SHA-256 fingerprint for Android App Links (`/.well-known/assetlinks.json`). Required for forks.  |

### Backend API for development

The Bayaan backend is a separate project. Without `BAYAAN_API_KEY`, these
features still work out of the box:

- **Quran reader** — text, translations, tafsir (via the `/api/quran-v4` proxy
  to the public Quran.com API).
- **Mushaf** — page rendering with bundled tajweed data
  (`public/data/qpc-hafs-tajweed.json`).
- **Transliteration** — bundled fallback (`public/data/transliteration.json`).
- **Adhkar** — bundled Hisnul Muslim JSON (`src/data/adhkar.json`).
- **Library** — bookmarks, favorites, playlists, notes (all `localStorage` via
  `src/stores/library-store.ts`).

These features require a valid `BAYAAN_API_KEY`:

- Reciter catalogue and profile pages.
- Audio playback and per-ayah timestamps.
- Reciter OG images.

For a rate-limited development key, open an issue titled
**"Community API key request"**. Then set:

```
NEXT_PUBLIC_BAYAAN_API_URL=https://api.thebayaan.com
BAYAAN_API_KEY=<community key>
```

### Running your own fork

The app is designed to run with zero setup against bundled data. To run your
fork against your own infrastructure under a different brand:

1. **Pick a name and brand** — see [TRADEMARKS.md](TRADEMARKS.md). Forks
   distributing under a different name must rebrand the application,
   marketing surfaces, and store listings.
2. **Backend** — point `NEXT_PUBLIC_BAYAAN_API_URL` and `BAYAAN_INTERNAL_API_URL`
   at a backend you control. The Bayaan backend is open source as a sibling
   project; see [self-hosting](#self-hosting-and-forks) below.
3. **Site URL and OG** — set `NEXT_PUBLIC_SITE_URL` to your deployment URL so
   canonical links, sitemap, robots, and OG metadata resolve correctly.
4. **Deep links** — set `ANDROID_SHA256_CERT` to your own Android app
   fingerprint and update `public/.well-known/apple-app-site-association`
   with your iOS app's Team ID and bundle. Leave blank to skip universal-link
   registration entirely.
5. **Privacy policy** — link to a policy you publish; the URL is referenced in
   the settings UI.

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

All four must pass. Husky + `lint-staged` already runs Prettier and ESLint on
staged files at commit time, but the type checker and full test suite are
yours to run.

### How versioning works

The repository follows [Semantic Versioning](https://semver.org/). Released
versions are tagged `vX.Y.Z` and recorded in [CHANGELOG.md](CHANGELOG.md).
Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`) drive
the version bump on release.

---

## Code standards

### TypeScript

- **Strict mode.** No `any`. Prefer type guards and narrowing over `as` casts.
- **Explicit return types** on exported / public functions; let inference
  handle locals.
- **Interfaces** for props and state shapes; **type aliases** for unions and
  utility types.
- `noUncheckedIndexedAccess` is on — array and record accesses return
  `T | undefined` and you must narrow.

### React + Next.js 16

- This repo is on **Next.js 16** — APIs, conventions, and file structure may
  differ from older Next.js knowledge. When in doubt, check the docs bundled
  in `node_modules/next/dist/docs/` and heed deprecation notices.
- **Server Components by default.** Add `"use client"` only when needed
  (interactivity, browser APIs, hooks).
- **Data fetching:** SWR on the client, `fetch` in Server Components on the
  server. No third-party data libraries on top of SWR.
- **State:** Zustand stores under `src/stores/`. Co-locate `persist` config
  with the store.
- **Routing:** App Router under `src/app/`. URL-addressable subpages over
  monolith pages.

### Styling

- **Tailwind CSS 4** utility-first. Use `class-variance-authority` (`cva`) for
  variant-driven components.
- Colors and radii go through theme tokens in `src/app/globals.css` and
  `tailwind.config.ts` — do not hardcode hex values in components. See
  [Design system](#design-system) below.
- Components follow shadcn conventions under `src/components/ui/`.

### Naming

- Files: `kebab-case.tsx` (e.g. `reciter-card.tsx`).
- Components: `PascalCase`.
- Directories: `kebab-case`.
- Hooks: `use-kebab-case.ts`, exported as `useCamelCase`.

### Do not

- Do not add features, refactors, or abstractions beyond what the task
  requires. Three similar lines is better than a premature abstraction.
- Do not commit `console.log`, commented-out code blocks, or stray TODOs.
- Do not skip the pre-commit hook (`--no-verify`) unless explicitly asked.
- Do not introduce backwards-compatibility shims or feature flags for code
  that no caller uses.

---

## Design system

The app uses a token-based color system defined in
[`src/app/globals.css`](src/app/globals.css). The same token names exist in
both light and dark themes; the values change. **Always reference tokens, not
hex.**

### Color tokens

| Token                   | Role                                                    |
| ----------------------- | ------------------------------------------------------- |
| `background`            | Page background                                         |
| `foreground`            | Primary text                                            |
| `card`                  | Card surface                                            |
| `card-foreground`       | Text on card                                            |
| `muted`                 | De-emphasised surface                                   |
| `muted-foreground`      | De-emphasised text (captions, metadata)                 |
| `border` / `input`      | Hairline borders, input strokes                         |
| `ring`                  | Focus ring                                              |
| `primary`               | Action and strong emphasis (text inverts to background) |
| `destructive`           | Destructive actions                                     |
| `surface`               | Listening surface base                                  |
| `surface-raised`        | Elevated listening surface                              |
| `surface-sunken`        | Inset listening surface                                 |
| `brand-main` / variants | Brand-tinted accents (use sparingly)                    |
| `sidebar*`              | Sidebar shell (always slightly warmer than background)  |

### Usage rules

- **Chrome and structure** use `foreground`, `muted-foreground`, `border`, and
  the `surface*` tokens. Avoid `primary` for ambient chrome.
- **Actions** (buttons that perform a user-initiated action) use `primary`.
- **Brand tokens** (`brand-main`, `brand-strong`, `brand-weak`) are reserved
  for moments where Bayaan's visual identity should be felt: empty states,
  empty placeholders, marketing banners.
- **Dark mode is gated by `[data-theme="dark"]`** on the document root.
  Tailwind's `dark:` variant works via the custom variant in `globals.css`.

Typography uses Manrope as the sans font (`--font-manrope`) and Scheherazade
New for Arabic text (`--font-scheherazade`). For Quranic text rendering, use
the explicit mushaf font picker in `src/lib/mushaf-fonts.ts`.

---

## Testing

- **Unit + integration** — Vitest with `@testing-library/react`. Test files
  live next to source as `*.test.ts(x)` or under `src/__tests__/`.
- **E2E** — Playwright under `e2e/`. Runs against a real `next start` server
  with no external credentials required.
- **Mocking** — MSW for HTTP request interception in tests.

When adding a feature, include at least one Vitest test covering the core
behaviour. E2E is reserved for critical user flows: Quran reading, reciter
listening, playlist creation, search.

Coverage is tracked in CI and uploaded as an artifact. We are ratcheting
coverage thresholds up over time; see `vitest.config.ts` for the current
floor.

---

## AI-assisted development

AI tools (Cursor, Copilot, Claude, etc.) are welcome. Two rules:

1. **You are responsible for every line you submit.** Review and understand AI
   output before pushing. Reviewers cannot tell where AI ends and you begin,
   so the bar for correctness, naming, and design is on you.
2. **Mark non-trivial AI-generated blocks with `// @ai`** at the end of the
   line (for a single line) or `// @ai-start` / `// @ai-end` comments wrapping
   a multi-line block. This makes it easy for reviewers to spend extra time on
   those areas and for future readers to know where the AI fingerprint sits.

The [PR template](.github/PULL_REQUEST_TEMPLATE.md) includes an AI disclosure
checkbox.

**Do not include AI tool names or attributions in commit messages.** The
commit history reflects authorship and intent, not which editor was used.

### Forks and Claude Code tooling

This repo's `.gitignore` excludes the `.claude/` directory because it can
contain operational paths and credentials private to a maintainer's machine.
Forks that want to ship their own project-versioned Claude Code skills or
scheduled tasks can opt-in by adding negation rules to the fork's own
`.gitignore`, e.g.:

```gitignore
!.claude/skills/
!.claude/scheduled-tasks/
```

Keep machine-local Claude state ignored: `.claude/settings.local.json`,
`scheduled_tasks.lock`, `.claude/projects/`.

---

## Architecture navigation

| What you are looking for                         | Where to find it                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Root layout, theme provider                      | `src/app/layout.tsx`                                                                |
| Route groups (app shell)                         | `src/app/(app)/`                                                                    |
| Middleware                                       | `middleware.ts`                                                                     |
| Bayaan API proxy                                 | `src/app/api/bayaan/[...path]/route.ts`                                             |
| Quran.com API proxy                              | `src/app/api/quran-v4/[...path]/route.ts`                                           |
| Audio player engine                              | `src/stores/player-store.ts`                                                        |
| Reader player                                    | `src/stores/reader-player-store.ts`                                                 |
| Library (favorites, bookmarks, playlists, notes) | `src/stores/library-store.ts`                                                       |
| Adhkar audio                                     | `src/lib/adhkar-audio.ts`                                                           |
| Mushaf rendering helpers                         | `src/lib/mushaf-fonts.ts`, `src/lib/mushaf-navigation.ts`, `src/lib/surah-pages.ts` |
| Verse timestamps                                 | `src/lib/timestamp-fetch.ts`, `src/lib/timestamp-utils.ts`                          |
| OG image generation                              | `src/lib/og.tsx`, `src/lib/og-urls.ts`                                              |
| UI primitives (shadcn)                           | `src/components/ui/`                                                                |
| Feature components                               | `src/components/<feature>/`                                                         |
| Shared hooks                                     | `src/hooks/`                                                                        |
| Static data                                      | `src/data/`, `public/data/`                                                         |

Full architecture documentation: [docs/architecture/current-state.md](docs/architecture/current-state.md).

### Library persistence

There is no sign-in. Bookmarks, favorites, playlists, notes, and highlights
are stored in the browser via Zustand's `persist` middleware
(`src/stores/library-store.ts` and related stores). Data stays on the device
and is not synced to a server.

The Bayaan API proxy (`src/app/api/bayaan/[...path]/route.ts`) forwards
catalogue requests using `BAYAAN_API_KEY`. Legacy `/v1/user/...` routes
return `410 Gone` with a message pointing callers to local storage.

---

## Pull request workflow

We use trunk-based development. Branch from `main`, target `main`. There is
no `develop` branch.

1. **Branch from `main`:**
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
   - `rfc/NNN-short-title` — Architectural RFC (see below)
3. **Before submitting:**
   ```bash
   npm run format
   npm run lint
   npm run typecheck
   npm test
   ```
4. **Open a PR targeting `main`** with a clear description of what changed and
   why. The PR template will prompt you for testing notes, screenshots, and
   an AI disclosure.
5. **Keep PRs focused.** One feature or fix per PR. Large scope changes are
   harder to review and more likely to introduce regressions.

### Commit message format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add reciter sort order in library
fix: resolve double slash in audio URL generation
chore: bump next to 16.3
docs: document backend API variables
refactor: extract surah-pages from the mushaf reader
```

Do not include AI tool names or attributions in commit messages.

---

## Architectural RFCs

Larger architectural changes — extracting modules into packages, defining
cross-cutting interfaces, modifying authentication or data persistence,
introducing new external services — go through a lightweight RFC process
before implementation lands.

An RFC PR adds a single document under [`docs/rfcs/`](docs/rfcs/) using the
[template](docs/rfcs/000-template.md). It may include scaffolding the design
enables (new types, contract test fixtures, CI workflow files) as long as no
existing behaviour changes. Refactors of existing code land in named
follow-up PRs that reference the merged RFC.

When in doubt, open a regular PR. Reviewers will redirect to the RFC track
if the scope justifies it.

---

## Self-hosting and forks

Bayaan is AGPL-3.0-or-later. You are welcome to fork and self-host, subject to
the license and to [TRADEMARKS.md](TRADEMARKS.md) (forks must rebrand if
distributing under a different name).

The web app talks to a backend by default. To self-host end-to-end:

1. **Backend** — run your own Bayaan backend (sibling project). Point
   `NEXT_PUBLIC_BAYAAN_API_URL` and `BAYAAN_INTERNAL_API_URL` at it.
2. **API key** — generate a key in your backend and set `BAYAAN_API_KEY`.
3. **CDN** — host the media (recitations, reciter images, mushaf fonts) on a
   CDN you control and set `NEXT_PUBLIC_BAYAAN_CDN_URL`. The Bayaan CDN is
   open to read but not redistribution; see
   [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for source attribution.
4. **Deploy** — any Node 22+ host works. The repo's CI builds the production
   bundle on every PR and we test deploys on Railway and Vercel.

If you only need a frontend pointed at the public Bayaan API for development,
the default `.env.example` is enough.

---

## Community and communication

- **GitHub Discussions** — questions, ideas, show-and-tell:
  <https://github.com/thebayaan/bayaan-web/discussions>
- **GitHub Issues** — bugs and feature requests. Use the templates.
- **Code of Conduct concerns** — `conduct@thebayaan.com` (private inbox).
- **Security vulnerabilities** — see [SECURITY.md](SECURITY.md). Do not open
  public issues.
- **Sibling projects:**
  - Mobile app: <https://github.com/thebayaan/Bayaan>
  - Backend: not yet public (status will be updated here).

---

## First contributions

If this is your first Bayaan PR or your first open-source PR:

1. **Pick something small.** Issues tagged `good-first-issue` are scoped for
   first-time contributors.
2. **Comment on the issue** before starting non-trivial work so reviewers can
   sanity-check the approach and avoid duplicate effort.
3. **Don't be discouraged by review feedback.** Most PRs receive at least one
   round of comments. We review to ship the change, not to grade it.
4. **Ask in Discussions** if the contributor docs are unclear. If the docs
   need fixing, the fix is itself a great first PR.

We particularly welcome contributions in these areas:

- Accessibility improvements (keyboard nav, screen reader labels,
  reduced-motion handling).
- Translations and tafaseer with mainstream scholarly sourcing (see
  [GOVERNANCE.md](GOVERNANCE.md) for scope rules).
- Mobile-web parity improvements.
- Test coverage on hooks and stores.

Welcome. We are glad you are here.
