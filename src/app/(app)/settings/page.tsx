import Link from "next/link";
import { branding } from "@/config/branding";

type SettingsItem = {
  href: string;
  title: string;
  description: string;
  external?: boolean;
};

const SETTING_GROUPS: { section: string; items: SettingsItem[] }[] = [
  {
    section: "Appearance",
    items: [
      {
        href: "/settings/appearance",
        title: "Theme",
        description: "Light, dark, sepia, or system theme for the app.",
      },
    ],
  },
  {
    section: "Quran",
    items: [
      {
        href: "/settings/reading",
        title: "Mushaf Settings",
        description: "Customize Quran display options and reading aids.",
      },
      {
        href: "/settings/translations",
        title: "Translations & Tafaseer",
        description: "Choose the translation and tafsir used in reading views.",
      },
      {
        href: "/settings/reading-themes",
        title: "Reading Themes",
        description: "Mushaf page colors for light and dark modes.",
      },
    ],
  },
  {
    section: "App & Data",
    items: [
      {
        href: "/settings/storage",
        title: "Storage",
        description: `View and manage local browser data used by ${branding.appName}.`,
      },
    ],
  },
  {
    section: "Feedback",
    items: [
      {
        href: branding.supportUrl,
        title: "Feature Requests",
        description: "Suggest improvements and new features.",
        external: true,
      },
      {
        href: branding.supportUrl,
        title: "Help & Support",
        description: `Get assistance with using ${branding.appName}.`,
        external: true,
      },
    ],
  },
  {
    section: `About ${branding.appName}`,
    items: [
      {
        href: "/settings/whats-new",
        title: "What's New",
        description: `Everything in the first public release of ${branding.appName} for the web.`,
      },
      {
        href: "/settings/about",
        title: `About ${branding.appName}`,
        description: "Mission, version, features, and project links.",
      },
      {
        href: "/settings/credits",
        title: "Credits & Shoutouts",
        description: `Projects, contributors, and communities that make ${branding.appName} possible.`,
      },
      {
        href: branding.sourceRepoUrl,
        title: "Contribute on GitHub",
        description: "Star, report issues, or submit a pull request.",
        external: true,
      },
      {
        href: branding.termsUrl,
        title: "Terms of Service",
        description: "Read our terms of service.",
        external: true,
      },
      {
        href: branding.privacyUrl,
        title: "Privacy Policy",
        description: "View our privacy policy.",
        external: true,
      },
    ],
  },
];

function SettingsCard({ item }: { item: SettingsItem }) {
  const className =
    "group block rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]";

  const content = (
    <>
      <p className="text-base font-medium">
        {item.title}
        {item.external ? (
          <span className="text-muted-foreground ml-1 text-xs">external</span>
        ) : null}
      </p>
      <p className="text-muted-foreground mt-0.5 text-xs">{item.description}</p>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

export default function SettingsOverviewPage() {
  return (
    <div className="max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <nav aria-label="Settings sections" className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <section key={group.section}>
            <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              {group.section}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <SettingsCard key={`${group.section}-${item.title}`} item={item} />
              ))}
            </div>
          </section>
        ))}
      </nav>
    </div>
  );
}
