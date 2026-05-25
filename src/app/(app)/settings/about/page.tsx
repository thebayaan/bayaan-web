import { SettingsShell } from "@/components/settings/settings-shell";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

export default function AboutSettingsPage() {
  return (
    <SettingsShell title="About">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Version</dt>
          <dd>{APP_VERSION}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Source code</dt>
          <dd>
            <a
              href="https://github.com/thebayaan/bayaan-web"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              GitHub
            </a>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">License</dt>
          <dd>
            <a
              href="https://github.com/thebayaan/bayaan-web/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              AGPL-3.0-or-later
            </a>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Mobile app</dt>
          <dd>
            <a
              href="https://apps.apple.com/app/bayaan/id6740906213"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              App Store
            </a>
          </dd>
        </div>
      </dl>
    </SettingsShell>
  );
}
