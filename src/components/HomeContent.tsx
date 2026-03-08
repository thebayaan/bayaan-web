"use client";

import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Mic2, BookOpen, Star, ChevronRight, Clock, Play } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Import real data
import reciterData from "@/data/reciters.json";
import surahData from "@/data/surahData.json";
import adhkarData from "@/data/adhkar.json";

type Tab = "reciters" | "surahs" | "adhkar";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: "reciters", label: "Reciters", icon: Mic2 },
  { id: "surahs", label: "Surahs", icon: BookOpen },
  { id: "adhkar", label: "Adhkar", icon: Star },
];

// Data transformation functions
function getReciters(): ReciterRowProps[] {
  return reciterData.slice(0, 6).map((reciter) => {
    // Find the first rewayat with the most complete data
    const primaryRewayat = reciter.rewayat.reduce((prev, current) =>
      (current.surah_total > prev.surah_total) ? current : prev
    );

    return {
      id: reciter.id,
      name: reciter.name,
      rewayah: primaryRewayat.name,
      surahs: primaryRewayat.surah_total
    };
  });
}

function getSurahs() {
  return surahData.slice(0, 8).map((surah) => ({
    number: surah.id,
    name: surah.name,
    transliteration: surah.translated_name_english,
    ayahs: surah.verses_count,
    arabic: surah.name_arabic,
  }));
}

function getAdhkarCategories() {
  const emojiMap: { [key: string]: string } = {
    'morning': '🌅',
    'evening': '🌙',
    'prayer': '🤲',
    'sleep': '😴',
    'food': '🍽️',
    'travel': '🚶',
    'default': '📿'
  };

  return adhkarData.categories.slice(0, 6).map((category) => {
    // Simple emoji assignment based on keywords in title
    const title = category.title.toLowerCase();
    let emoji = emojiMap.default;

    if (title.includes('morning')) emoji = emojiMap.morning;
    else if (title.includes('evening')) emoji = emojiMap.evening;
    else if (title.includes('prayer')) emoji = emojiMap.prayer;
    else if (title.includes('sleep')) emoji = emojiMap.sleep;
    else if (title.includes('food') || title.includes('drink')) emoji = emojiMap.food;
    else if (title.includes('travel') || title.includes('going')) emoji = emojiMap.travel;

    return {
      emoji,
      title: category.title,
      count: category.dhikr_count
    };
  });
}

function getRecentActivity(): RecentCardProps[] {
  const surahs = getSurahs();
  const reciters = getReciters();
  const adhkar = getAdhkarCategories();

  // For now, create a simple recent activity from popular items
  // In a real app, this would come from user's actual activity
  return [
    {
      title: surahs[0].name,
      subtitle: `${surahs[0].ayahs} verses`,
      type: "Surah" as const,
      href: `/mushaf/${surahs[0].number}`,
    },
    {
      title: reciters[0].name,
      subtitle: reciters[0].rewayah,
      type: "Reciter" as const,
      href: `/reciter/${reciters[0].id}`,
    },
    {
      title: adhkar[0].title,
      subtitle: `${adhkar[0].count} adhkar`,
      type: "Adhkar" as const,
      href: `/adhkar`, // Navigate to adhkar main page since we don't have category IDs
    },
    {
      title: surahs[1].name,
      subtitle: `${surahs[1].ayahs} verses`,
      type: "Surah" as const,
      href: `/mushaf/${surahs[1].number}`,
    },
    {
      title: reciters[1].name,
      subtitle: reciters[1].rewayah,
      type: "Reciter" as const,
      href: `/reciter/${reciters[1].id}`,
    },
  ];
}

/**
 * HomeContent — client component powering the home page tab UI.
 * Tabs: Reciters / Surahs / Adhkar, with placeholder content.
 */
export function HomeContent() {
  const [activeTab, setActiveTab] = useState<Tab>("reciters");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold tracking-tight mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Assalamu Alaikum
        </h1>
        <p className="text-sm" style={{ color: "var(--color-hint)" }}>
          What would you like to listen to today?
        </p>
      </div>

      {/* Recently played — horizontal scroll */}
      <section className="mb-8" aria-label="Recently played">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader>Recently Played</SectionHeader>
          <Link
            href="/collection"
            className="text-[10.5px] font-semibold uppercase tracking-[1.2px] flex items-center gap-0.5 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-section-header)" }}
          >
            See all <ChevronRight size={11} strokeWidth={2} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {getRecentActivity().map((item, i) => (
            <RecentCard key={i} {...item} />
          ))}
        </div>
      </section>

      <Divider className="mb-8" />

      {/* Tab selector */}
      <div className="mb-6">
        <div
          className="inline-flex gap-1 p-1 rounded-xl"
          style={{ backgroundColor: "var(--color-card-bg)" }}
          role="tablist"
          aria-label="Browse content"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 h-8 rounded-lg",
                  "text-[13px] font-medium",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
                  isActive ? "shadow-sm" : "hover:bg-[var(--color-hover)]",
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--color-active-bg)",
                        color: "var(--color-text)",
                      }
                    : { color: "var(--color-icon)" }
                }
              >
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab panels */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-label={TABS.find((t) => t.id === activeTab)?.label}
        className="animate-fade-in"
        key={activeTab}
      >
        {activeTab === "reciters" && <RecitersPanel />}
        {activeTab === "surahs" && <SurahsPanel />}
        {activeTab === "adhkar" && <AdhkarPanel />}
      </div>
    </div>
  );
}

/* ─── Tab panels ─────────────────────────────────────────────────────────────── */

function RecitersPanel() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <SectionHeader className="col-span-full mb-1">All Reciters</SectionHeader>
      {getReciters().map((reciter, i) => (
        <ReciterRow key={i} {...reciter} />
      ))}
    </div>
  );
}

function SurahsPanel() {
  return (
    <div>
      <SectionHeader className="mb-3">114 Surahs</SectionHeader>
      <Card>
        {getSurahs().map((surah, i) => (
          <div key={i}>
            {i > 0 && <Divider />}
            <Link
              href={`/mushaf/${surah.number}`}
              className={cn(
                "flex items-center gap-4 w-full px-4 py-3",
                "text-left transition-colors duration-100",
                "hover:bg-[var(--color-hover)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-text)]",
                "block"
              )}
            >
              {/* Number */}
              <span
                className="text-xs font-semibold tabular-nums w-6 text-center shrink-0"
                style={{ color: "var(--color-hint)" }}
              >
                {surah.number}
              </span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--color-label)" }}
                >
                  {surah.name}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: "var(--color-hint)" }}
                >
                  {surah.transliteration} · {surah.ayahs} verses
                </p>
              </div>

              {/* Arabic name */}
              <span
                className="text-base font-medium shrink-0"
                style={{ color: "var(--color-icon)" }}
                lang="ar"
                dir="rtl"
              >
                {surah.arabic}
              </span>

              <Play
                size={13}
                style={{ color: "var(--color-icon)" }}
                strokeWidth={1.8}
                className="shrink-0"
              />
            </Link>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdhkarPanel() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <SectionHeader className="col-span-full mb-1">Categories</SectionHeader>
      {getAdhkarCategories().map((category, i) => (
        <Card
          key={i}
          className="group cursor-pointer hover:border-[var(--color-hover)]"
        >
          <Link href="/adhkar" className="flex items-center gap-4 p-4 w-full text-left block">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: "var(--color-secondary-bg)" }}
              aria-hidden="true"
            >
              {category.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--color-label)" }}
              >
                {category.title}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: "var(--color-hint)" }}
              >
                {category.count} adhkar
              </p>
            </div>
            <ChevronRight
              size={15}
              strokeWidth={1.8}
              style={{ color: "var(--color-icon)" }}
              className="shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Card>
      ))}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

interface RecentCardProps {
  title: string;
  subtitle: string;
  type: string;
  href: string;
}

function RecentCard({ title, subtitle, type, href }: RecentCardProps) {
  return (
    <Card className="shrink-0 w-[160px] cursor-pointer group hover:border-[var(--color-hover)]">
      <Link href={href} className="flex flex-col gap-3 p-3.5 w-full text-left block">
        {/* Art placeholder */}
        <div
          className="h-[100px] w-full rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--color-secondary-bg)" }}
          aria-hidden="true"
        >
          <Play
            size={22}
            strokeWidth={1.5}
            style={{ color: "var(--color-icon)" }}
            className="translate-x-0.5 opacity-60 group-hover:opacity-90 transition-opacity"
          />
        </div>
        <div>
          <p
            className="text-xs font-semibold truncate"
            style={{ color: "var(--color-label)" }}
          >
            {title}
          </p>
          <p
            className="text-[10px] truncate mt-0.5"
            style={{ color: "var(--color-hint)" }}
          >
            {subtitle}
          </p>
        </div>
        <span
          className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md self-start"
          style={{
            color: "var(--color-section-header)",
            backgroundColor: "var(--color-secondary-bg)",
          }}
        >
          {type}
        </span>
      </Link>
    </Card>
  );
}

interface ReciterRowProps {
  id: string;
  name: string;
  rewayah: string;
  surahs: number;
}

function ReciterRow({ id, name, rewayah, surahs }: ReciterRowProps) {
  return (
    <Card className="group cursor-pointer">
      <Link href={`/reciter/${id}`} className="flex items-center gap-3 p-3.5 w-full text-left block">
        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold"
          style={{
            backgroundColor: "var(--color-secondary-bg)",
            color: "var(--color-icon)",
          }}
          aria-hidden="true"
        >
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-label)" }}
          >
            {name}
          </p>
          <p
            className="text-[11px] truncate"
            style={{ color: "var(--color-hint)" }}
          >
            {rewayah} · {surahs} surahs
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock
            size={12}
            strokeWidth={1.5}
            style={{ color: "var(--color-icon)" }}
          />
          <Play
            size={14}
            strokeWidth={1.8}
            style={{ color: "var(--color-icon)" }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </Link>
    </Card>
  );
}

// Placeholder data removed - now using real data from JSON files
