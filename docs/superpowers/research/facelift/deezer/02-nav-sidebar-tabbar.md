# Brief 02 — Top nav / sidebar / tab bar

**Target:** https://www.deezer.com
**Date:** 2026-04-16

## 1. What the target does

Deezer ships a split chrome. Desktop (>=1024px): a persistent ~220px left rail — logo top, tight icon+label stack (Home, Explore), divider, Playlists block with an inline "Create your first playlist" CTA card. Sticky, non-collapsing — it vanishes rather than shrinking at intermediate widths. Top bar is a thin sticky strip: centred search pill, right-side account CTAs (Plans / Log in / Sign up; avatar menu when logged-in). Active state is a subtle white-alpha-10 pill background plus filled-glyph swap; inactive items sit muted-foreground with a hairline hover tint. No badges, no counts.

Below ~768px the sidebar collapses to an icon-only flush-left strip (Home + Explore only, Playlists hidden), search bar persists, and the bottom is reserved for the player bar — Deezer web renders no 5-item mobile tab bar (that pattern is native-app only). Logged-out visitors never see this app chrome; they get a separate horizontal marketing nav (Plans / Features / Music / Log in / Sign up).

## 2. Screenshots / selector evidence

- `/Users/osmansaeday/theBayaan/bayaan-web/docs/superpowers/research/facelift/screenshots/deezer/02-desktop-explore.png` — desktop sidebar + top search bar on /channels/explore (1440x900)
- `/Users/osmansaeday/theBayaan/bayaan-web/docs/superpowers/research/facelift/screenshots/deezer/02-mobile-explore.png` — mobile icon rail + top search + player bar (390x844)
- `/Users/osmansaeday/theBayaan/bayaan-web/docs/superpowers/research/facelift/screenshots/deezer/02-mobile-explore-nocookies.png` — cookie-banner-free variant
- `/Users/osmansaeday/theBayaan/bayaan-web/docs/superpowers/research/facelift/screenshots/deezer/02-desktop-landing.png` — logged-out marketing top nav (different chrome)

## 3. Transferable patterns → Bayaan

- `[shell]` Active = text-alpha pill + filled-glyph swap — Bayaan already matches at `sidebar-nav-item.tsx:27-31`; keep.
- `[shell]` Sidebar footer as identity zone (avatar + one utility link) — Bayaan's `sidebar.tsx:39-49` mirrors this; consider a "Saved verses" teaser card above it, echoing Deezer's Create-playlist CTA.
- `[shell]` `md:w-16` icon rail → `lg:w-60` labelled rail (`sidebar.tsx:27`) matches Deezer's breakpoint ladder — keep, don't add a collapse toggle.
- `[shell]` Promote Search from a sidebar item to a sticky top-bar pill at `lg:` to mirror Deezer and reclaim a nav row.

## 4. Do NOT copy

- Deezer's separate logged-out marketing top nav — Bayaan should present one shell to all users.
- Hiding mobile nav behind the player bar — Bayaan's 5-item `MobileTabBar` (`mobile-tab-bar.tsx`) is stronger than Deezer's web gap.

## 5. One-line verdict

Keep Bayaan's sidebar almost as-is; promote Search to a desktop top bar and reserve the sidebar footer for identity, matching Deezer's cleaner separation.
