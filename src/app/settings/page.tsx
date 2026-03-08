import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import { Languages } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader>Settings</SectionHeader>

      <div className="grid gap-4">
        <Link href="/settings/translations">
          <Card className="p-6 hover:bg-[var(--color-hover)] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-card)] border border-[var(--color-card-border)]">
                <Languages size={20} style={{ color: "var(--color-icon)" }} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">Translations</h3>
                <p className="text-sm text-[var(--color-label)]">Configure translation preferences</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
