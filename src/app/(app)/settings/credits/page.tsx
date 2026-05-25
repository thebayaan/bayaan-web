import { SettingsShell } from "@/components/settings/settings-shell";

interface CreditItem {
  title: string;
  description: string;
  href?: string;
}

const CREDIT_GROUPS: { section: string; items: CreditItem[] }[] = [
  {
    section: "Quran Data",
    items: [
      {
        title: "Quranic Universal Library",
        description: "Advanced Quranic data and word-level information by Tarteel.",
        href: "https://qul.tarteel.ai",
      },
      {
        title: "Quran Foundation API",
        description: "Comprehensive Quran API services by Quran.com.",
        href: "https://api-docs.quran.foundation",
      },
    ],
  },
  {
    section: "Audio Sources",
    items: [
      {
        title: "MP3Quran",
        description: "Comprehensive reciter collection.",
        href: "https://mp3quran.net",
      },
    ],
  },
  {
    section: "Design Resources",
    items: [
      {
        title: "SVGRepo",
        description: "Open source icons and illustrations.",
        href: "https://www.svgrepo.com",
      },
      {
        title: "Manrope Font",
        description: "Modern geometric sans-serif font family.",
        href: "https://fonts.google.com/specimen/Manrope",
      },
      {
        title: "Uthmani Font",
        description: "Quranic font resources from Arabic Fonts.",
        href: "https://arabicfonts.net",
      },
      {
        title: "Quran.com Resources",
        description: "Surah name SVGs, icons, and Quran resource data.",
        href: "https://api-docs.quran.foundation",
      },
    ],
  },
  {
    section: "Open Source Libraries",
    items: [
      {
        title: "Next.js",
        description: "React framework powering the Bayaan web app.",
        href: "https://nextjs.org",
      },
      {
        title: "React",
        description: "UI framework for the web experience.",
        href: "https://react.dev",
      },
      {
        title: "Zustand",
        description: "Local state and persisted preference storage.",
        href: "https://zustand-demo.pmnd.rs",
      },
    ],
  },
  {
    section: "Special Thanks",
    items: [
      {
        title: "Our Contributors",
        description: "Everyone who helped make Bayaan better.",
      },
      {
        title: "Beta Testers",
        description: "For their valuable feedback and suggestions.",
      },
      {
        title: "Muslim Community",
        description: "For continuous support, guidance, and duas.",
      },
    ],
  },
  {
    section: "Design & Art",
    items: [
      {
        title: "Dr. Naoki Yamamoto",
        description: "Custom designed splash screen calligraphy for Bayaan.",
        href: "https://twitter.com/NaokiQYamamoto",
      },
    ],
  },
];

export default function CreditsSettingsPage() {
  return (
    <SettingsShell
      title="Credits & Shoutouts"
      description="Bayaan would not be possible without these projects, organizations, and people."
    >
      <div className="space-y-6">
        {CREDIT_GROUPS.map((group) => (
          <section key={group.section}>
            <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              {group.section}
            </h2>
            <div className="overflow-hidden rounded-xl bg-[var(--text-alpha-04)]">
              {group.items.map((item, index) => {
                const content = (
                  <>
                    <span className="block text-sm font-medium">
                      {item.title}
                      {item.href ? (
                        <span className="text-muted-foreground ml-1 text-xs">external</span>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      {item.description}
                    </span>
                  </>
                );
                const className = `block px-4 py-3 text-left transition-colors ${
                  index > 0 ? "border-t border-[var(--text-alpha-06)]" : ""
                } ${item.href ? "hover:bg-[var(--text-alpha-06)]" : ""}`;

                return item.href ? (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.title} className={className}>
                    {content}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <p className="text-muted-foreground text-center text-sm">
          Made with care by the Bayaan team.
        </p>
      </div>
    </SettingsShell>
  );
}
