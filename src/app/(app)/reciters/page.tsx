"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ReciterCard } from "@/components/reciter-card";
import { ProfileIcon, SearchIcon } from "@/components/icons";
import { useReciters } from "@/hooks/use-reciters";
import { normalize } from "@/lib/normalize";
import { cn } from "@/lib/utils";
import { QIRAAT_TEACHERS, REWAYAT_REGISTRY, type RewayatEntry } from "@/data/rewayat-registry";
import type { RecitationStyle, Reciter, Rewayat } from "@/types/reciter";

type SortOption = "featured" | "alphabetical" | "rewayat" | "complete";

interface AdvancedFilters {
  styles: RecitationStyle[];
  rewayat: string[];
  sortBy: SortOption;
}

interface Chip {
  label: string;
  type: "all" | "teacher" | "student" | "separator";
  isSelected: boolean;
}

const DEFAULT_FILTERS: AdvancedFilters = {
  styles: [],
  rewayat: [],
  sortBy: "featured",
};

const STYLE_OPTIONS: Array<{ label: string; value: RecitationStyle }> = [
  { label: "Mojawwad", value: "mojawwad" },
  { label: "Molim", value: "molim" },
  { label: "Murattal", value: "murattal" },
];

const SORT_OPTIONS: Array<{ label: string; value: SortOption; description: string }> = [
  { label: "Featured", value: "featured", description: "Bayaan picks, then names" },
  { label: "A-Z", value: "alphabetical", description: "Alphabetical by reciter" },
  { label: "Most rewayat", value: "rewayat", description: "Largest rewayah catalog first" },
  { label: "Complete Quran", value: "complete", description: "Full 114-surah recordings first" },
];

function matchesRewayahName(rewayahName: string, entry: RewayatEntry): boolean {
  const source = normalize(rewayahName);
  const target = normalize(entry.name);
  return source.includes(target) || target.includes(source);
}

function resolveRewayahEntry(rewayahName: string | undefined): RewayatEntry | undefined {
  if (!rewayahName) return undefined;
  return REWAYAT_REGISTRY.find((entry) => matchesRewayahName(rewayahName, entry));
}

function fallbackTeacher(name: string): string | undefined {
  const [, teacher] = name.split("A'n");
  return teacher?.trim();
}

function fallbackStudent(name: string): string | undefined {
  const [student] = name.split("A'n");
  return student?.trim();
}

function resolveTeacher(rewayahName: string | undefined): string | undefined {
  if (!rewayahName) return undefined;
  return resolveRewayahEntry(rewayahName)?.teacher ?? fallbackTeacher(rewayahName);
}

function resolveStudent(rewayahName: string | undefined): string | undefined {
  if (!rewayahName) return undefined;
  return resolveRewayahEntry(rewayahName)?.student ?? fallbackStudent(rewayahName);
}

function getStudentsForTeacher(teacher: string, reciters: Reciter[]): string[] {
  const students = new Set<string>();
  for (const reciter of reciters) {
    for (const rewayah of reciter.rewayat) {
      if (resolveTeacher(rewayah.name) !== teacher) continue;
      const student = resolveStudent(rewayah.name);
      if (student) students.add(student);
    }
  }
  return Array.from(students).sort((a, b) => a.localeCompare(b));
}

function getDynamicChips(
  reciters: Reciter[],
  selectedTeacher: string | null,
  selectedStudent: string | null,
): Chip[] {
  const chips: Chip[] = [
    { label: "All", type: "all", isSelected: !selectedTeacher && !selectedStudent },
  ];

  if (!selectedTeacher) {
    const availableTeachers = new Set(
      reciters.flatMap((reciter) =>
        reciter.rewayat.map((rewayah) => resolveTeacher(rewayah.name)).filter(Boolean),
      ),
    );
    for (const teacher of QIRAAT_TEACHERS) {
      if (availableTeachers.has(teacher)) {
        chips.push({ label: teacher, type: "teacher", isSelected: false });
      }
    }
    return chips;
  }

  const students = getStudentsForTeacher(selectedTeacher, reciters);
  if (!selectedStudent) {
    chips.push(
      ...students.map((student) => ({
        label: student,
        type: "student" as const,
        isSelected: false,
      })),
    );
    if (students.length > 0) {
      chips.push({ label: "A'n", type: "separator", isSelected: false });
    }
  } else {
    chips.push({ label: selectedStudent, type: "student", isSelected: true });
    chips.push({ label: "A'n", type: "separator", isSelected: false });
  }

  chips.push({ label: selectedTeacher, type: "teacher", isSelected: true });
  return chips;
}

function rewayahMatchesTeacherStudent(
  rewayah: Rewayat,
  selectedTeacher: string | null,
  selectedStudent: string | null,
): boolean {
  if (!selectedTeacher) return true;
  if (resolveTeacher(rewayah.name) !== selectedTeacher) return false;
  if (!selectedStudent) return true;
  return resolveStudent(rewayah.name) === selectedStudent;
}

function matchesStyle(rewayah: Rewayat, styles: RecitationStyle[]): boolean {
  if (styles.length === 0) return true;
  return styles.some((style) => {
    if (style === "murattal") return rewayah.style.toLowerCase().startsWith("murattal");
    return rewayah.style === style;
  });
}

function matchesRewayahFilter(rewayah: Rewayat, selectedRewayatIds: string[]): boolean {
  if (selectedRewayatIds.length === 0) return true;
  const entry = resolveRewayahEntry(rewayah.name);
  return entry ? selectedRewayatIds.includes(entry.id) : selectedRewayatIds.includes(rewayah.name);
}

function hasCompleteQuran(reciter: Reciter): boolean {
  return reciter.rewayat.some((rewayah) => rewayah.surah_total >= 114);
}

function sortReciters(reciters: Reciter[], sortBy: SortOption): Reciter[] {
  return [...reciters].sort((a, b) => {
    if (sortBy === "featured") {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      if (a.image_url && !b.image_url) return -1;
      if (!a.image_url && b.image_url) return 1;
    }

    if (sortBy === "rewayat") {
      const delta = b.rewayat.length - a.rewayat.length;
      if (delta !== 0) return delta;
    }

    if (sortBy === "complete") {
      const aComplete = hasCompleteQuran(a);
      const bComplete = hasCompleteQuran(b);
      if (aComplete && !bComplete) return -1;
      if (!aComplete && bComplete) return 1;
    }

    return a.name.localeCompare(b.name);
  });
}

function getAvailableRewayat(reciters: Reciter[]): RewayatEntry[] {
  return REWAYAT_REGISTRY.filter((entry) =>
    reciters.some((reciter) =>
      reciter.rewayat.some((rewayah) => matchesRewayahName(rewayah.name, entry)),
    ),
  );
}

function filterReciters({
  reciters,
  query,
  selectedTeacher,
  selectedStudent,
  filters,
}: {
  reciters: Reciter[];
  query: string;
  selectedTeacher: string | null;
  selectedStudent: string | null;
  filters: AdvancedFilters;
}): Reciter[] {
  const normalizedQuery = normalize(query.trim());
  const filtered = reciters.filter((reciter) => {
    if (normalizedQuery) {
      const searchable = [
        reciter.name,
        reciter.name_arabic ?? "",
        ...reciter.rewayat.flatMap((rewayah) => [rewayah.name, rewayah.style]),
      ]
        .map(normalize)
        .join(" ");
      if (!searchable.includes(normalizedQuery)) return false;
    }

    return reciter.rewayat.some(
      (rewayah) =>
        rewayahMatchesTeacherStudent(rewayah, selectedTeacher, selectedStudent) &&
        matchesStyle(rewayah, filters.styles) &&
        matchesRewayahFilter(rewayah, filters.rewayat),
    );
  });

  return sortReciters(filtered, filters.sortBy);
}

function filterCount(filters: AdvancedFilters): number {
  return (
    filters.styles.length +
    filters.rewayat.length +
    (filters.sortBy === DEFAULT_FILTERS.sortBy ? 0 : 1)
  );
}

export default function RecitersPage() {
  const { reciters, isLoading, error } = useReciters();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdvancedFilters>(DEFAULT_FILTERS);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const dynamicChips = useMemo(
    () => getDynamicChips(reciters, selectedTeacher, selectedStudent),
    [reciters, selectedTeacher, selectedStudent],
  );
  const availableRewayat = useMemo(() => getAvailableRewayat(reciters), [reciters]);
  const filteredReciters = useMemo(
    () =>
      filterReciters({
        reciters,
        query: deferredQuery,
        selectedTeacher,
        selectedStudent,
        filters,
      }),
    [reciters, deferredQuery, selectedTeacher, selectedStudent, filters],
  );

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedTeacher !== null ||
    selectedStudent !== null ||
    filterCount(filters) > 0;

  function handleChipPress(chip: Chip): void {
    if (chip.type === "separator") return;
    if (chip.type === "all") {
      setSelectedTeacher(null);
      setSelectedStudent(null);
      return;
    }
    if (chip.type === "teacher") {
      if (chip.label === selectedTeacher) {
        setSelectedTeacher(null);
        setSelectedStudent(null);
        return;
      }
      setSelectedTeacher(chip.label);
      setSelectedStudent(null);
      return;
    }
    if (chip.label === selectedStudent) {
      setSelectedStudent(null);
      return;
    }
    setSelectedStudent(chip.label);
  }

  function clearAllFilters(): void {
    setSearchQuery("");
    setSelectedTeacher(null);
    setSelectedStudent(null);
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
            Listen
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Browse reciters</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Search the full Bayaan reciter catalog, then narrow by qira&apos;at teacher, student,
            recitation style, and rewayah.
          </p>
        </div>
        <div className="text-muted-foreground text-sm">
          {isLoading ? "Loading reciters..." : `${filteredReciters.length} of ${reciters.length}`}
        </div>
      </div>

      <div className="border-border bg-surface/80 sticky top-0 z-20 -mx-4 border-y px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search reciters, rewayat, or styles..."
              className="h-10 rounded-full pl-9"
              aria-label="Search reciters"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterDialogOpen(true)}
            className={cn(
              "border-border bg-background hover:bg-muted inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
              filterCount(filters) > 0 && "border-brand-main text-brand-main",
            )}
          >
            Filters
            {filterCount(filters) > 0 ? (
              <span className="bg-brand-main text-brand-main-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                {filterCount(filters)}
              </span>
            ) : null}
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {dynamicChips.map((chip) =>
            chip.type === "separator" ? (
              <span
                key={`${chip.type}-${chip.label}`}
                className="text-muted-foreground inline-flex h-8 items-center px-1 text-xs"
              >
                {chip.label}
              </span>
            ) : (
              <button
                key={`${chip.type}-${chip.label}`}
                type="button"
                onClick={() => handleChipPress(chip)}
                className={cn(
                  "border-border bg-background hover:bg-muted inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition-colors",
                  chip.isSelected && "bg-brand-main text-brand-main-foreground border-brand-main",
                )}
              >
                {chip.label}
              </button>
            ),
          )}
        </div>

        {hasActiveFilters ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {filteredReciters.length} {filteredReciters.length === 1 ? "reciter" : "reciters"}{" "}
              match the current filters
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-brand-main hover:text-brand-strong shrink-0 text-xs font-semibold"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <EmptyState
          icon={<ProfileIcon size={48} />}
          title="Could not load reciters"
          subtitle={error instanceof Error ? error.message : "Try refreshing in a moment."}
        />
      ) : isLoading ? (
        <RecitersSkeleton />
      ) : filteredReciters.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={48} />}
          title="No reciters found"
          subtitle="Try clearing a filter or searching by another spelling."
          cta={{ label: "Clear all filters", onClick: clearAllFilters }}
        />
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {filteredReciters.map((reciter) => (
            <ReciterCard key={reciter.id} reciter={reciter} />
          ))}
        </div>
      )}

      {filterDialogOpen ? (
        <AdvancedFilterDialog
          open={filterDialogOpen}
          onOpenChange={setFilterDialogOpen}
          filters={filters}
          onFiltersChange={setFilters}
          availableRewayat={availableRewayat}
        />
      ) : null}
    </div>
  );
}

function RecitersSkeleton() {
  return (
    <div
      className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7"
      aria-hidden="true"
    >
      {Array.from({ length: 21 }).map((_, i) => (
        <div key={i} className="space-y-2 p-1.5">
          <Skeleton className="aspect-square rounded-md" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function AdvancedFilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  availableRewayat,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  availableRewayat: RewayatEntry[];
}) {
  const [draft, setDraft] = useState(filters);

  function toggleStyle(style: RecitationStyle): void {
    setDraft((current) => ({
      ...current,
      styles: current.styles.includes(style)
        ? current.styles.filter((value) => value !== style)
        : [...current.styles, style],
    }));
  }

  function toggleRewayah(id: string): void {
    setDraft((current) => ({
      ...current,
      rewayat: current.rewayat.includes(id)
        ? current.rewayat.filter((value) => value !== id)
        : [...current.rewayat, id],
    }));
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) setDraft(filters);
    onOpenChange(nextOpen);
  }

  function applyFilters(): void {
    onFiltersChange(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(82vh,760px)] max-w-2xl flex-col overflow-hidden p-0">
        <div className="border-border flex items-start justify-between gap-4 border-b p-5">
          <div>
            <DialogTitle>Filter reciters</DialogTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Combine style, rewayah, and sorting filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground rounded-full px-2 py-1 text-sm transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <FilterSection title="Recitation styles">
            {STYLE_OPTIONS.map((style) => (
              <FilterChip
                key={style.value}
                selected={draft.styles.includes(style.value)}
                onClick={() => toggleStyle(style.value)}
              >
                {style.label}
              </FilterChip>
            ))}
          </FilterSection>

          <FilterSection title="Rewayat types">
            {availableRewayat.map((rewayah) => (
              <FilterChip
                key={rewayah.id}
                selected={draft.rewayat.includes(rewayah.id)}
                onClick={() => toggleRewayah(rewayah.id)}
              >
                {rewayah.displayName}
              </FilterChip>
            ))}
          </FilterSection>

          <section>
            <h2 className="mb-3 text-sm font-semibold">Sort by</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, sortBy: option.value }))}
                  className={cn(
                    "border-border bg-background hover:bg-muted rounded-xl border p-3 text-left transition-colors",
                    draft.sortBy === option.value && "border-brand-main bg-brand-light",
                  )}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="border-border bg-background flex gap-2 border-t p-4">
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_FILTERS)}
            className="border-border hover:bg-muted h-10 flex-1 rounded-full border text-sm font-semibold transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong h-10 flex-[2] rounded-full text-sm font-semibold transition-colors"
          >
            Apply filters
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-border bg-background hover:bg-muted rounded-full border px-3 py-2 text-sm transition-colors",
        selected && "border-brand-main bg-brand-light text-brand-main font-semibold",
      )}
    >
      {children}
    </button>
  );
}
