"use client";

import { useMemo, useState } from "react";
import { AVAILABLE_TAFASEER, type TafsirEdition } from "@/data/available-tafaseer";
import { useTranslationResources } from "@/hooks/use-translation-resources";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { SettingsShell } from "@/components/settings/settings-shell";

type Tab = "translation" | "tafsir";

function sortSelectedFirst<T>(items: T[], isSelected: (item: T) => boolean): T[] {
  return [...items].sort((a, b) => {
    const aSelected = isSelected(a);
    const bSelected = isSelected(b);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });
}

export default function TranslationsSettingsPage() {
  const translationIds = useReadingSettingsStore((s) => s.translationIds);
  const setTranslationIds = useReadingSettingsStore((s) => s.setTranslationIds);
  const tafsirId = useReadingSettingsStore((s) => s.tafsirId);
  const setTafsirId = useReadingSettingsStore((s) => s.setTafsirId);
  const { translations, isLoading } = useTranslationResources();
  const [tab, setTab] = useState<Tab>("translation");

  const tafaseerByLanguage = useMemo(
    () =>
      AVAILABLE_TAFASEER.reduce<Record<string, TafsirEdition[]>>((groups, edition) => {
        const editions = groups[edition.language] ?? [];
        editions.push(edition);
        groups[edition.language] = editions;
        return groups;
      }, {}),
    [],
  );

  const sortedTranslations = useMemo(
    () =>
      sortSelectedFirst(translations, (translation) => String(translation.id) === translationIds),
    [translations, translationIds],
  );

  const sortedTafaseerGroups = useMemo(() => {
    const groups = Object.entries(tafaseerByLanguage).map(([language, editions]) => ({
      language,
      editions: sortSelectedFirst(editions, (edition) => edition.id === tafsirId),
    }));

    return sortSelectedFirst(groups, (group) =>
      group.editions.some((edition) => edition.id === tafsirId),
    );
  }, [tafaseerByLanguage, tafsirId]);

  return (
    <SettingsShell
      title="Translations & Tafaseer"
      description="Choose the Quran translation and tafsir used across reading surfaces."
    >
      <div className="space-y-6">
        <div
          role="tablist"
          aria-label="Translation or Tafsir"
          className="border-border bg-surface-sunken inline-flex rounded-full border p-1"
        >
          <TabButton active={tab === "translation"} onClick={() => setTab("translation")}>
            Translation
          </TabButton>
          <TabButton active={tab === "tafsir"} onClick={() => setTab("tafsir")}>
            Tafsir
          </TabButton>
        </div>

        {tab === "translation" ? (
          <section role="tabpanel" aria-label="Translation">
            <div className="mb-3 flex items-baseline justify-end gap-3">
              {isLoading ? (
                <span className="text-muted-foreground text-xs">Loading catalog...</span>
              ) : null}
            </div>
            <div className="grid gap-2">
              {sortedTranslations.map((translation) => {
                const id = String(translation.id);
                const selected = translationIds === id;

                return (
                  <button
                    key={translation.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTranslationIds(id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? "border-foreground bg-[var(--text-alpha-08)]"
                        : "border-transparent bg-[var(--text-alpha-04)] hover:bg-[var(--text-alpha-06)]"
                    }`}
                  >
                    <span className="block text-sm font-medium">{translation.name}</span>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      {translation.author_name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section role="tabpanel" aria-label="Tafsir">
            <div className="space-y-5">
              {sortedTafaseerGroups.map(({ language, editions }) => (
                <div key={language}>
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                    {language}
                  </h3>
                  <div className="grid gap-2">
                    {editions.map((edition) => {
                      const selected = tafsirId === edition.id;

                      return (
                        <button
                          key={edition.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setTafsirId(edition.id)}
                          className={`rounded-xl border p-4 text-left transition-colors ${
                            selected
                              ? "border-foreground bg-[var(--text-alpha-08)]"
                              : "border-transparent bg-[var(--text-alpha-04)] hover:bg-[var(--text-alpha-06)]"
                          }`}
                        >
                          <span className="block text-sm font-medium">{edition.name}</span>
                          {edition.authorName ? (
                            <span className="text-muted-foreground mt-1 block text-xs">
                              {edition.authorName}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </SettingsShell>
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`duration-fast ease-standard rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
