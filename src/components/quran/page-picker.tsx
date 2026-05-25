"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { navigateToMushafPage } from "@/lib/mushaf-navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PagePicker({ open, onOpenChange }: PagePickerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const page = Number(value.trim());
    if (!Number.isInteger(page) || page < 1 || page > 604) {
      setError("Enter a page between 1 and 604.");
      return;
    }

    navigateToMushafPage(page, router);
    onOpenChange(false);
    setValue("");
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Go to page</h2>
          <p className="text-muted-foreground text-sm">Jump to a mushaf page between 1 and 604.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            min={1}
            max={604}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            placeholder="Page number"
            className="border-border bg-surface-sunken w-full rounded-lg border px-3 py-2 text-sm"
            aria-label="Mushaf page number"
            autoFocus
          />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <button
            type="submit"
            className="bg-brand-main hover:bg-brand-strong w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Go to page
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
