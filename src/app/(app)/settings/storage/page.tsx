"use client";

import { useEffect, useMemo, useState } from "react";
import { SettingsShell } from "@/components/settings/settings-shell";

const BAYAAN_STORAGE_KEYS = [
  "bayaan-theme",
  "bayaan-reading-settings",
  "bayaan-player",
  "bayaan-reader-player",
  "bayaan-recently-played",
  "bayaan-recent-searches",
  "bayaan-library",
  "bayaan-dhikr-counts",
] as const;

interface StorageRow {
  key: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getLocalRows(): StorageRow[] {
  if (typeof window === "undefined") return [];

  return BAYAAN_STORAGE_KEYS.map((key) => {
    const value = window.localStorage.getItem(key) ?? "";
    return { key, size: new Blob([value]).size };
  }).filter((row) => row.size > 0);
}

export default function StorageSettingsPage() {
  const [rows, setRows] = useState<StorageRow[]>([]);
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setRows(getLocalRows()), 0);
    void navigator.storage
      ?.estimate?.()
      .then(setEstimate)
      .catch(() => setEstimate(null));

    return () => window.clearTimeout(timeoutId);
  }, []);

  const totalLocal = useMemo(() => rows.reduce((sum, row) => sum + row.size, 0), [rows]);

  const clearLocalData = () => {
    const confirmed = window.confirm(
      "Clear Bayaan settings, library, recent activity, and local preferences from this browser?",
    );
    if (!confirmed) return;

    BAYAAN_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    setRows([]);
    setMessage("Local Bayaan data was cleared. Refresh the app to reload default settings.");
  };

  return (
    <SettingsShell
      title="Storage"
      description="View and manage the Bayaan data stored in this browser."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Browser Storage
          </h2>
          <div className="rounded-xl bg-[var(--text-alpha-04)] p-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Bayaan local data</span>
              <span>{formatBytes(totalLocal)}</span>
            </div>
            {estimate?.usage !== undefined ? (
              <div className="mt-2 flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Total browser estimate</span>
                <span>{formatBytes(estimate.usage)}</span>
              </div>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Local Data
          </h2>
          {rows.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-[var(--text-alpha-04)]">
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className={`flex justify-between gap-4 px-4 py-3 text-sm ${
                    index > 0 ? "border-t border-[var(--text-alpha-06)]" : ""
                  }`}
                >
                  <span>{row.key.replace("bayaan-", "")}</span>
                  <span className="text-muted-foreground">{formatBytes(row.size)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground rounded-xl bg-[var(--text-alpha-04)] p-4 text-sm">
              No Bayaan local data is currently stored in this browser.
            </p>
          )}
        </section>

        <section className="rounded-xl bg-[var(--text-alpha-04)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Clear local data</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Removes web settings, recent activity, saved library data, and local preferences.
              </p>
            </div>
            <button
              type="button"
              onClick={clearLocalData}
              className="bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-85"
            >
              Clear
            </button>
          </div>
          {message ? <p className="text-muted-foreground mt-3 text-xs">{message}</p> : null}
        </section>
      </div>
    </SettingsShell>
  );
}
