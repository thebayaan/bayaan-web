# Brief 10 — Mobile / responsive behavior

**Target:** https://www.deezer.com (home, captured at 1440 / 1024 / 768 / 430 / 375)
**Date:** 2026-04-16

## 1. Breakpoint strategy

Deezer's web player is built for desktop first and degrades to a mobile-marketing funnel rather than a true responsive app. Three regimes are observable from the screenshots:

- **>=1024px (10-desktop-1440.png, 10-tablet-1024.png):** full left sidebar (~240px, labelled nav: Home/Explore/Favourites/Playlists/History/Following), top search bar with context filter, 4-to-6 column carousel rails, persistent bottom player bar ~88px tall spanning full width.
- **768px (10-tablet-768.png):** sidebar collapses but the rails and bottom player bar keep desktop layout compressed; carousels shrink to 2-3 tiles. There is no icon-only rail stage — it's basically the desktop layout at small width, so horizontal overflow clips some controls.
- **<=430px (10-mobile-430.png, 10-mobile-375.png):** the web app redirects logged-out users to a marketing/app-install landing ("Profitez de 3 mois offerts / Télécharger l'app"). The functional player is gated behind the native app. No PWA-grade mobile web UI is served.

Effective breakpoints inferred: ~1280 (max rails), ~1024 (sidebar shrink), ~768 (rail count drop), ~600 (switch to marketing).

## 2. Touch targets & density

On the mobile marketing view, primary CTAs ("Télécharger", "S'inscrire") are full-width pill buttons ~48px tall with 16px side padding — WCAG-comfortable. Secondary nav (hamburger, search, profile) sits in a ~56px top bar with 44x44 hit areas. Inside the desktop web player at 768px the controls stay desktop-sized (~32px hit targets, tight 8px gaps) and are not thumb-friendly, reinforcing that Deezer treats <768 as "go to app" rather than "re-layout for touch".

## 3. Mobile-exclusive patterns `[shell]`

```
# 10-mobile-375.png / 10-mobile-430.png show:
# - Marketing hero (no app chrome)
# - Bottom-anchored "Open in app / Continue on web" sheet
# - Hamburger drawer for catalog browse
# - No persistent mini-player, no swipeable queue on web-mobile
```

The native iOS/Android Deezer apps (per Mobbin + community threads) use: sticky mini-player above the tab bar, full-screen now-playing reached via upward swipe, a queue bottom-sheet with drag handles, and swipe-on-row to queue/like. The web at 430 px does **not** reproduce these — it punts to the app.

## 4. Mobile-only nav modes

- **Top app bar** on mobile web: logo left, hamburger + search + profile right (~56px).
- **Hamburger drawer:** slide-in from left containing Music / Podcasts / Radio / Offers / Download app.
- **Sticky bottom CTA sheet** (install app), dismissable with a small close button — functionally Deezer's "mobile tab bar replacement".
- No bottom tab bar on web. In the native apps it is a 5-tab bottom bar (Home, Explore, Library, Search, Premium).

## 5. Takeaways for Bayaan

Bayaan already goes further than Deezer-web on mobile: `src/components/layout/app-shell.tsx:10-15` renders a real `MobileTabBar` below `md` and hides `BottomPlayerBar` there, while `src/components/layout/sidebar.tsx:27` collapses the sidebar from `w-60` (`lg`) to `w-16` (`md`) to hidden (`<md`) — a 3-stage responsive nav. `src/components/layout/mobile-tab-bar.tsx:20` uses `fixed bottom-0 md:hidden` with `backdrop-blur-2xl`, matching native-app conventions Deezer only ships in its apps. `tailwind.config.ts` uses default Tailwind v4 breakpoints (sm 640 / md 768 / lg 1024 / xl 1280), which aligns with Deezer's observed thresholds.

Gaps to close vs native-app patterns Deezer web lacks but competitors have: (a) a sticky mini-player stacked above the tab bar on `<md` (currently `BottomPlayerBar` is `hidden md:block` in `app-shell.tsx:12`), (b) an upward-swipe expandable now-playing sheet, (c) swipe-to-queue row actions, (d) safe-area-inset padding on the tab bar (`pb-[env(safe-area-inset-bottom)]`) — not present in `globals.css`. Adding these puts Bayaan ahead of Deezer-web and on par with Spotify/Apple Music mobile.
