# Bayaan Design Tokens

All runtime tokens live in `globals.css` and are exposed to Tailwind via `@theme inline`.

## Mode switching

- Attribute: `[data-theme="light" | "dark" | "sepia"]` on `<html>`.
- Written by: `src/components/theme-provider.tsx`.
- Source of truth: `useThemeStore` in `src/stores/theme-store.ts`.

## Layers (outer → inner)

1. **Raw values** — OKLCH, hex, rgba. Scoped to `:root` or `[data-theme="X"]`.
2. **Semantic tokens** — `--surface`, `--brand-main`, `--motion-fast`, etc.
3. **Shadcn aliases** — `--background`, `--foreground`, `--card`, etc. (for library compatibility).
4. **Tailwind utilities** — `bg-surface`, `text-brand-main`, `duration-fast`, `ease-standard`.

## Token groups

### Surfaces

- `--surface` — page background
- `--surface-raised` — cards, panels, sheets
- `--surface-sunken` — input wells, code blocks (darker than surface in all modes)

### Brand accent ladder

- `--brand-main` — primary CTA, active-state, link
- `--brand-strong` — pressed / hover
- `--brand-weak` — selection, hover-bg (20% alpha)
- `--brand-light` — ambient, rails (8% alpha)

Sepia flips brand cool → warm: purple `#a238ff` → warm brown `#72603f`.

**Name note:** these are `--brand-*`, not `--accent-*`, to avoid collision with shadcn's neutral `--accent` token used for hover/selected component states.

### Motion

- `--motion-fast: 160ms` — hover color/opacity swap, word-sync color flip
- `--motion-moderate: 200ms` — chip active, row highlight, popover enter
- `--motion-regular: 400ms` — player bar show/hide, sheet/drawer open
- `--motion-slow: 600ms` — hero crossfade, mushaf page turn
- `--ease-standard` — `cubic-bezier(0.4, 0, 0.2, 1)`

Tailwind utilities: `duration-fast`, `duration-moderate`, `duration-regular`, `duration-slow`, `ease-standard`.

### Elevation

- `--elevation-0: none`
- `--elevation-s: 0 1px 20px rgba(...)`
- `--elevation-m: 0 6px 30px rgba(...)`
- `--elevation-l: 0 12px 48px rgba(...)`

Shadow RGB tuned per mode so elevation survives dark backgrounds.

### Alpha ladders

- `--text-alpha-04 … --text-alpha-85` — text-tinted fills. Used for hover backgrounds and muted surfaces.

## Contributing

When adding a new semantic token:

1. Add the raw value in `:root` and every `[data-theme="..."]` block (light, dark, sepia) that needs to override it. Theme-invariant tokens (e.g., motion durations) go in `:root` only.
2. Expose it via `@theme inline` as a `--color-*` alias if you want a Tailwind utility class for it.
3. Document it in this README under the appropriate group.
4. Avoid hex literals in components — always go through a token.

Synthesis reference: `docs/superpowers/research/facelift/synthesis.md` §2.
