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
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        type="search"
        placeholder="Search reciters and surahs..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-[var(--text-alpha-04)] border-[var(--text-alpha-06)]"
      />
    </div>
  );
}
