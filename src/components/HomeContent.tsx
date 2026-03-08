"use client";

import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Mic2, BookOpen, Star, ChevronRight, Clock, Play } from "lucide-react";
import { useState } from "react";

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
          <button
            className="text-[10.5px] font-semibold uppercase tracking-[1.2px] flex items-center gap-0.5 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-section-header)" }}
          >
            See all <ChevronRight size={11} strokeWidth={2} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {RECENT_PLACEHOLDER.map((item, i) => (
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
      {RECITERS_PLACEHOLDER.map((reciter, i) => (
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
        {SURAHS_PLACEHOLDER.map((surah, i) => (
          <div key={i}>
            {i > 0 && <Divider />}
            <button
              className={cn(
                "flex items-center gap-4 w-full px-4 py-3",
                "text-left transition-colors duration-100",
                "hover:bg-[var(--color-hover)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-text)]",
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
            </button>
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
      {ADHKAR_PLACEHOLDER.map((category, i) => (
        <Card
          key={i}
          className="group cursor-pointer hover:border-[var(--color-hover)]"
        >
          <button className="flex items-center gap-4 p-4 w-full text-left">
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
          </button>
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
}

function RecentCard({ title, subtitle, type }: RecentCardProps) {
  return (
    <Card className="shrink-0 w-[160px] cursor-pointer group hover:border-[var(--color-hover)]">
      <button className="flex flex-col gap-3 p-3.5 w-full text-left">
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
      </button>
    </Card>
  );
}

interface ReciterRowProps {
  name: string;
  rewayah: string;
  surahs: number;
}

function ReciterRow({ name, rewayah, surahs }: ReciterRowProps) {
  return (
    <Card className="group cursor-pointer">
      <button className="flex items-center gap-3 p-3.5 w-full text-left">
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
      </button>
    </Card>
  );
}

/* ─── Placeholder data ───────────────────────────────────────────────────────── */

const RECENT_PLACEHOLDER: RecentCardProps[] = [
  {
    title: "Mishary Rashid",
    subtitle: "Al-Fatiha · 7 verses",
    type: "Reciter",
  },
  { title: "Al-Baqarah", subtitle: "Abdul Basit", type: "Surah" },
  { title: "Morning Adhkar", subtitle: "32 adhkar", type: "Adhkar" },
  {
    title: "Abdur-Rahman As-Sudais",
    subtitle: "Al-Kahf · 110 verses",
    type: "Reciter",
  },
  { title: "Yaseen", subtitle: "Saad Al-Ghamdi", type: "Surah" },
];

const RECITERS_PLACEHOLDER: ReciterRowProps[] = [
  { name: "Mishary Rashid Al-Afasy", rewayah: "Hafs 'an Asim", surahs: 114 },
  { name: "Abdul Basit Abdus Samad", rewayah: "Hafs 'an Asim", surahs: 114 },
  { name: "Abdur-Rahman As-Sudais", rewayah: "Hafs 'an Asim", surahs: 114 },
  { name: "Saad Al-Ghamdi", rewayah: "Hafs 'an Asim", surahs: 114 },
  { name: "Maher Al-Muaiqly", rewayah: "Hafs 'an Asim", surahs: 114 },
  { name: "Muhammad Ayyub", rewayah: "Hafs 'an Asim", surahs: 114 },
];

const SURAHS_PLACEHOLDER = [
  {
    number: 1,
    name: "Al-Fatiha",
    transliteration: "The Opening",
    ayahs: 7,
    arabic: "الفاتحة",
  },
  {
    number: 2,
    name: "Al-Baqarah",
    transliteration: "The Cow",
    ayahs: 286,
    arabic: "البقرة",
  },
  {
    number: 3,
    name: "Ali Imran",
    transliteration: "The Family of Imran",
    ayahs: 200,
    arabic: "آل عمران",
  },
  {
    number: 4,
    name: "An-Nisa",
    transliteration: "The Women",
    ayahs: 176,
    arabic: "النساء",
  },
  {
    number: 5,
    name: "Al-Maidah",
    transliteration: "The Table Spread",
    ayahs: 120,
    arabic: "المائدة",
  },
  {
    number: 36,
    name: "Yaseen",
    transliteration: "Yaseen",
    ayahs: 83,
    arabic: "يس",
  },
  {
    number: 67,
    name: "Al-Mulk",
    transliteration: "The Sovereignty",
    ayahs: 30,
    arabic: "الملك",
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    transliteration: "The Sincerity",
    ayahs: 4,
    arabic: "الإخلاص",
  },
];

const ADHKAR_PLACEHOLDER = [
  { emoji: "🌅", title: "Morning Adhkar", count: 32 },
  { emoji: "🌙", title: "Evening Adhkar", count: 28 },
  { emoji: "🤲", title: "After Prayer", count: 15 },
  { emoji: "😴", title: "Before Sleep", count: 12 },
  { emoji: "🍽️", title: "Food & Drink", count: 8 },
  { emoji: "🚶", title: "Going Out", count: 6 },
];
