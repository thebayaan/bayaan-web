import Link from "next/link";

const SECTIONS = [
  {
    href: "/settings/appearance",
    title: "Appearance",
    description: "Light, dark, or system theme for the app.",
  },
  {
    href: "/settings/reading",
    title: "Reading",
    description: "Arabic font size, transliteration, word-by-word, tajweed colors.",
  },
  {
    href: "/settings/reading-themes",
    title: "Reading Themes",
    description: "Mushaf page colors for light and dark modes.",
  },
  {
    href: "/settings/about",
    title: "About",
    description: "Version, credits, links.",
  },
] as const;

export default function SettingsOverviewPage() {
  return (
    <div className="max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <nav aria-label="Settings sections" className="grid gap-2 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
          >
            <p className="text-base font-medium">{section.title}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{section.description}</p>
          </Link>
        ))}
      </nav>
    </div>
  );
}
