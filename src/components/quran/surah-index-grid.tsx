"use client";

import { useMemo, useState } from "react";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { SurahIndexCard } from "./surah-index-card";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

const surahs = surahData as unknown as Surah[];

type Tab = "surah" | "juz" | "revelation";

export function SurahIndexGrid() {
  const [tab, setTab] = useState<Tab>("surah");
  const [filter, setFilter] = useState("");
  const lastReadSurahId = useReadingSettingsStore((s) => s.lastReadSurahId);

  const sorted = useMemo(() => {
    const list = [...surahs];
    if (tab === "revelation") {
      list.sort((a, b) => a.revelation_order - b.revelation_order);
    }
    return list;
  }, [tab]);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return sorted;
    return sorted.filter(
      (s) =>
        String(s.id).includes(f) ||
        s.name.toLowerCase().includes(f) ||
        s.translated_name_english.toLowerCase().includes(f) ||
        s.name_arabic.includes(filter.trim()),
    );
  }, [sorted, filter]);

  return (
    <div className="px-10 pb-20">
      <header className="flex flex-col gap-3 pt-12 pb-8">
        <h1 className="text-[56px] leading-none font-extrabold tracking-[-0.025em]">
          Read the Quran
        </h1>
        <p className="text-muted-foreground max-w-2xl text-[17px] leading-relaxed">
          114 surahs. 6,236 verses. Browse by chapter, Juz, or revelation order — or jump straight
          into your last place.
        </p>
      </header>

      <div className="border-border-divider flex flex-wrap items-center gap-6 border-b pb-2">
        <div className="flex items-center gap-7">
          <TabButton active={tab === "surah"} onClick={() => setTab("surah")}>
            Surah <span className="text-muted-foreground ml-1 text-xs font-medium">114</span>
          </TabButton>
          <TabButton active={tab === "juz"} onClick={() => setTab("juz")}>
            Juz <span className="text-muted-foreground ml-1 text-xs font-medium">30</span>
          </TabButton>
          <TabButton active={tab === "revelation"} onClick={() => setTab("revelation")}>
            Revelation Order
          </TabButton>
        </div>
        <div className="flex-1" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter surahs"
          className="border-border bg-surface-sunken duration-fast ease-standard w-60 rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-[var(--brand-weak)] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 pt-7 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <SurahIndexCard key={s.id} surah={s} isResume={lastReadSurahId === s.id} />
        ))}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 py-3.5 text-[15px] transition-colors ${
        active
          ? "text-foreground border-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground border-transparent font-medium"
      }`}
    >
      {children}
    </button>
  );
}
