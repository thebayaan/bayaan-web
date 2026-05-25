import { SettingsShell } from "@/components/settings/settings-shell";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

const LAUNCH_SECTIONS = [
  {
    title: "Listen",
    highlights: [
      "Browse 200+ reciters with full profiles, multiple rewayat, and curated collections.",
      "Play, pause, seek, shuffle, repeat, and adjust speed from a persistent player and full Now Playing view.",
      "Ayah-level timestamps so playback can start at the exact verse you choose.",
      "Shareable recitation links with optional timestamp and autoplay.",
    ],
  },
  {
    title: "Read & Study",
    highlights: [
      "Read all 114 surahs in list view or switch to a full 604-page digital Mushaf.",
      "Translations, transliteration, word-by-word meanings, and tajweed coloring.",
      "Tafsir from multiple English, Arabic, and Urdu editions.",
      "Bookmarks, highlights, notes, copy, share, and play-from-ayah on every verse.",
      "Reading themes for light and dark modes, adjustable Arabic font size, and resume where you left off.",
    ],
  },
  {
    title: "Your Collection",
    highlights: [
      "Playlists you create and reorder, saved locally in your browser.",
      "Favorite reciters, loved tracks, bookmarks, notes, and verse highlights.",
      "Continue listening and continue reading cards on Home.",
    ],
  },
  {
    title: "Adhkar",
    highlights: [
      "Hisnul Muslim collections from morning and evening adhkar to travel, salah, and more.",
      "Arabic text with transliteration and translation, plus a built-in tasbeeh counter.",
    ],
  },
  {
    title: "Search & Navigate",
    highlights: [
      "Unified search across surahs, reciters, translation text, pages, juz, and verses.",
      "Command palette (⌘K) to jump anywhere in the app instantly.",
      "Explore by rewayah and curated collections: Featured, Exclusives, Tajweed, and Memorization.",
    ],
  },
  {
    title: "Built for the Web",
    highlights: [
      "Light, dark, sepia, and system themes with a responsive desktop and mobile layout.",
      "Keyboard shortcuts for playback, volume, and search.",
      "Media Session support for lock-screen controls where your browser allows it.",
      "Rich link previews and deep links for surahs, verses, mushaf pages, reciters, and adhkar.",
      "Open source under AGPL — no account required; your library stays on your device.",
    ],
  },
] as const;

export default function WhatsNewSettingsPage() {
  return (
    <SettingsShell title="What's New" description="The first public release of Bayaan on the web.">
      <div className="space-y-8">
        <section className="rounded-xl bg-[var(--text-alpha-04)] p-4">
          <p className="text-muted-foreground text-xs tracking-wider uppercase">Launch</p>
          <p className="mt-2 text-sm leading-6">
            Welcome to Bayaan Web — the open-source browser companion to the Bayaan mobile app. This
            is our first published release: listen to the Quran, read the Mushaf, study with
            translation and tafsir, remember Allah through adhkar, and keep your personal library —
            all in one place, free in your browser.
          </p>
          <p className="text-muted-foreground mt-3 text-xs">Version {APP_VERSION}</p>
        </section>

        {LAUNCH_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              {section.title}
            </h2>
            <ul className="overflow-hidden rounded-xl bg-[var(--text-alpha-04)]">
              {section.highlights.map((highlight, index) => (
                <li
                  key={highlight}
                  className={`px-4 py-3 text-sm leading-6 ${
                    index > 0 ? "border-t border-[var(--text-alpha-06)]" : ""
                  }`}
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="rounded-xl bg-[var(--text-alpha-04)] p-4">
          <h2 className="text-sm font-semibold">What&apos;s next</h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            We will keep improving Bayaan Web on GitHub. Star the repo, open issues, or contribute
            code — and tell us what you want to see in the next release.
          </p>
          <a
            href="https://github.com/thebayaan/bayaan-web"
            target="_blank"
            rel="noreferrer"
            className="bg-foreground text-background mt-3 inline-flex rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-85"
          >
            Bayaan Web on GitHub
          </a>
        </section>
      </div>
    </SettingsShell>
  );
}
