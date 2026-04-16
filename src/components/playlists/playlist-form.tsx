"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";

interface PlaylistFormValues {
  name: string;
  description: string;
}

interface PlaylistFormProps {
  initialValues?: PlaylistFormValues;
  submitLabel: string;
  onSubmit: (values: PlaylistFormValues) => Promise<void>;
  onCancel: () => void;
}

export function PlaylistForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: PlaylistFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isDisabled = pending || name.trim().length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    startTransition(() => {
      void onSubmit({ name: trimmed, description: description.trim() }).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="playlist-name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id="playlist-name"
          name="name"
          autoFocus
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--text-alpha-10)] bg-[var(--text-alpha-04)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-alpha-35)]"
        />
      </div>
      <div>
        <label htmlFor="playlist-description" className="mb-1 block text-sm font-medium">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="playlist-description"
          name="description"
          maxLength={500}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-[var(--text-alpha-10)] bg-[var(--text-alpha-04)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-alpha-35)]"
        />
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isDisabled}
          className="bg-foreground text-background rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
