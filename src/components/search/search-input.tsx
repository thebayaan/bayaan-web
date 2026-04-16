"use client";

import { SearchIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({ value, onChange, className }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        size={18}
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
      />
      <Input
        type="search"
        placeholder="Search reciters and surahs..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] pl-10"
      />
    </div>
  );
}
