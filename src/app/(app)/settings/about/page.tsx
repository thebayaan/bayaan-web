import { SettingsShell } from "@/components/settings/settings-shell";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

const FEATURES = [
  {
    title: "Quran recitation",
    description: "Listen to renowned reciters and Bayaan collections from the web app.",
  },
  {
    title: "Reading tools",
    description: "Read with translation, tafsir, transliteration, word-by-word, and tajweed aids.",
  },
  {
    title: "Personal library",
    description: "Save favorites, playlists, bookmarks, notes, and recent activity locally.",
  },
] as const;

const COMING_SOON = [
  "More reciter and rewayah preference controls on web.",
  "A fuller web changelog experience.",
  "More settings parity as mobile-only features become useful in the browser.",
] as const;

export default function AboutSettingsPage() {
  return (
    <SettingsShell title="About Bayaan" description="Your companion for Quranic recitation.">
      <div className="space-y-8">
        <section className="rounded-xl bg-[var(--text-alpha-04)] p-4">
          <h2 className="text-sm font-semibold">Alhamdulillah</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            All praise is due to Allah for blessing us with the opportunity to serve His Book and
            the Ummah. Bayaan is dedicated to making beautiful Quran recitation accessible through a
            calm, intuitive experience.
          </p>
        </section>

        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Our Mission
          </h2>
          <p className="text-muted-foreground rounded-xl bg-[var(--text-alpha-04)] p-4 text-sm leading-6">
            We strive to connect people with the Holy Quran through high quality recitation,
            respectful reading tools, and simple ways to continue a daily Quran journey.
          </p>
        </section>

        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Features
          </h2>
          <div className="grid gap-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl bg-[var(--text-alpha-04)] p-4">
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Coming Soon
          </h2>
          <div className="overflow-hidden rounded-xl bg-[var(--text-alpha-04)]">
            {COMING_SOON.map((item, index) => (
              <p
                key={item}
                className={`px-4 py-3 text-sm ${
                  index > 0 ? "border-t border-[var(--text-alpha-06)]" : ""
                }`}
              >
                {item}
              </p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            App Details
          </h2>
          <dl className="space-y-3 rounded-xl bg-[var(--text-alpha-04)] p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Version</dt>
              <dd>{APP_VERSION}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Source code</dt>
              <dd>
                <a
                  href="https://github.com/thebayaan/bayaan-web"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  GitHub
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">License</dt>
              <dd>
                <a
                  href="https://github.com/thebayaan/bayaan-web/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  AGPL-3.0-or-later
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Mobile app</dt>
              <dd>
                <a
                  href="https://apps.apple.com/app/bayaan/id6740906213"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  App Store
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </SettingsShell>
  );
}
