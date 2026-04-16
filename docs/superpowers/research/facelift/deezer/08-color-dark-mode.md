# Deezer — 08 Color System, Palette, Dark Mode

**Date:** 2026-04-16
**Source:** Playwright MCP had a sticky redirect bug (reported `page.goto(deezer)` but landed on quran.com). Pivoted to Firecrawl screenshots + `curl` of Deezer's CDN stylesheets (`bootstrap-tempo…css`, `app-backstage-plain-html…css`) to extract real tokens.
**Screenshots:** `/Users/osmansaeday/theBayaan/bayaan-web/docs/superpowers/research/facelift/screenshots/deezer/08-*.png`

## 1. What Deezer Does

Dual-theme "Tempo" system, gated by `[data-theme="dark"|"light"]` on `<body>`. Unlogged marketing ships dark. Accent purple `#a238ff`. Intent split (success/warning/error). Album/artist heroes use a **cover-art-derived gradient** fading into `--color-bg-main`.

| Token                                     | Light                                         | Dark                  |
| ----------------------------------------- | --------------------------------------------- | --------------------- |
| `--color-bg-main` (surface)               | `#fdfcfe`                                     | `#0f0d13`             |
| `--color-bg-secondary` (raised)           | `#f5f2f8`                                     | `#1b191f`             |
| `--color-bg-tertiary` (sunken)            | `#ebe7ee`                                     | `#29282d`             |
| `--color-text-main` / `-secondary`        | `#0f0d13` / `#6f6d71`                         | `#fdfcfe` / `#a9a6aa` |
| `--color-border-neutral-primary`          | `#c2c0c4`                                     | `#555257`             |
| `--transparent-bg` (scrim)                | `#ffffff80`                                   | `#0000004d`           |
| `--color-accent-{main,strong,weak,light}` | `#a238ff` / `#9333e8` / `#c17aff` / `#d09aff` | same                  |
| `--color-intent-{success,warning,error}`  | `#00b23d` / `#ec7f11` / `#df3c3c`             | same                  |

Grey ramp theme-invariant (`50 #f8f8f9` → `900 #121216`). Elevation: `--tempo-elevation-s: 0 1px 20px 0 #1f1f1f59`; `-m: 0 6px 30px 0 #1f1f1f59`.

## 2. Screenshots

- `08-homepage-dark.png` — unlogged landing, dark theme, purple CTA
- `08-us-album-1036821.png` — album with cover-art gradient backdrop
- `08-us-artist-27.png` — artist hero, full-bleed extracted gradient
- `08-us-channels-explore.png` — Explore grid on pure `#0f0d13`
- `08-us-offers-plans.png` — plans mixing brand-tier backgrounds

## 3. Bayaan Color / Dark Mode — Current State

- `[reading]` Tokens in `:root` + `.dark` use **oklch** (not hex), cool-blue lean; no raised/sunken tiers — `/Users/osmansaeday/theBayaan/bayaan-web/src/app/globals.css:41-105`
- `[reading]` Only three surfaces via overloaded shadcn names (`background`, `card`, `popover`); no `-secondary`/`-tertiary` hierarchy — `globals.css:45-82`
- `[reading]` Alpha utilities `--text-alpha-{04…85}` exist but aren't wired into Tailwind — `globals.css:108-124`
- `[shell]` `tailwind.config.ts` empty of color extends; tokens only reach Tailwind via `@theme inline` in `globals.css` — `/Users/osmansaeday/theBayaan/bayaan-web/tailwind.config.ts:6-13`
- `[shell]` Theme switch is class-toggle (`.dark`), not `data-theme` attr — `/Users/osmansaeday/theBayaan/bayaan-web/src/components/theme-provider.tsx:9-22`
- `[shell]` No accent scale, no `--success`/`--warning`; only single `--destructive` — `globals.css:59,91`
- `[shell]` No cover-art-driven gradients on reciter/surah heroes

## 4. Recommendations

1. Three-tier surfaces: `--surface`, `--surface-raised`, `--surface-sunken` (mirror `bg-main`/`secondary`/`tertiary`). Map `card`/`popover` → raised.
2. Accent ramp `--accent-{main,strong,weak,light}` as Islamic-green equivalent of Deezer's purple ladder; same hue across modes.
3. Split intent: `--success`, `--warning`, keep `--destructive` — for bookmark toasts, download states, auth errors.
4. Distinct `--border-primary` vs `--border-divider`; add `--overlay` scrim.
5. Extract dominant color from cover art; composite `linear-gradient(180deg, extracted 0%, var(--surface) 60%)` on reciter/surah heroes — matches `08-us-album-*`.
6. Elevation tokens (`--elevation-s`, `--elevation-m`) replacing ad-hoc Tailwind shadows.
7. Write `data-theme` attribute alongside `.dark` class so future attribute-scoped selectors stay portable.
