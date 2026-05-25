# Bayaan Web Documentation

The documentation hub for the Bayaan Quran web app. All docs live in this
directory.

**Tech stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 (strict) ·
Tailwind CSS 4 · shadcn-style primitives · SWR · Zustand · MSW · Vitest ·
Playwright.

---

## Getting started

New to the project? Read these in order:

1. [../README.md](../README.md) — project overview, features, quick start.
2. [../CONTRIBUTING.md](../CONTRIBUTING.md) — setup guide, code standards, PR
   workflow.
3. [architecture/current-state.md](architecture/current-state.md) — how the
   pieces fit together.
4. [contributing/self-hosting.md](contributing/self-hosting.md) — running the
   stack against your own backend.

---

## Architecture

| Document                                          | Description                                              |
| ------------------------------------------------- | -------------------------------------------------------- |
| [current-state.md](architecture/current-state.md) | System overview: routes, data, state, audio, persistence |

---

## Features

| Document                          | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| [player.md](features/player.md)   | Audio player engine, queue, Media Session integration  |
| [reader.md](features/reader.md)   | Quran reading view, verse interactions, deep links     |
| [mushaf.md](features/mushaf.md)   | Mushaf page rendering, fonts, tajweed, page navigation |
| [adhkar.md](features/adhkar.md)   | Hisnul Muslim dhikr data, audio coordinator, counters  |
| [library.md](features/library.md) | Bookmarks, favorites, playlists, notes (localStorage)  |

---

## Deployment

| Document                                  | Description                                             |
| ----------------------------------------- | ------------------------------------------------------- |
| [deployment.md](deployment/deployment.md) | Build, environment variables, hosting (Railway, Vercel) |

---

## Architectural RFCs

The RFC process is described in [rfcs/README.md](rfcs/README.md). New RFCs
should use [rfcs/000-template.md](rfcs/000-template.md).

---

## Contributing

| Document                                        | Description                              |
| ----------------------------------------------- | ---------------------------------------- |
| [self-hosting.md](contributing/self-hosting.md) | Run the web app against your own backend |

For everything else, see [../CONTRIBUTING.md](../CONTRIBUTING.md).
