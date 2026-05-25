"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Reciter, Rewayat } from "@/types/reciter";

export interface ResolvedReciter {
  reciter: Reciter;
  rewayat: Rewayat;
}

interface ReciterPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  reciters: ResolvedReciter[];
  selectedId: string | null;
  onPick: (choice: ResolvedReciter) => void;
}

export function ReciterPickerDialog({
  open,
  onOpenChange,
  description,
  reciters,
  selectedId,
  onPick,
}: ReciterPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogTitle>Choose a reciter</DialogTitle>
        <DialogDescription className="mb-3">{description}</DialogDescription>
        <ul className="max-h-80 space-y-1 overflow-y-auto" aria-label="Available reciters">
          {reciters.map(({ reciter, rewayat }) => {
            const selected = reciter.id === selectedId;
            return (
              <li key={reciter.id}>
                <button
                  type="button"
                  onClick={() => onPick({ reciter, rewayat })}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--text-alpha-06)] ${
                    selected ? "bg-brand-light" : ""
                  }`}
                >
                  <span className="bg-muted h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    {reciter.image_url ? (
                      <Image
                        src={reciter.image_url}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{reciter.name}</span>
                    <span className="text-muted-foreground block truncate text-xs capitalize">
                      {rewayat.style} · {rewayat.name}
                    </span>
                  </span>
                  {selected ? (
                    <span className="text-brand-main shrink-0 text-xs font-semibold">Current</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
