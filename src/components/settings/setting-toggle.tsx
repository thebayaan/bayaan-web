"use client";

interface SettingToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function SettingToggle({ label, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm">{label}</label>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative h-6 w-10 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-[var(--text-alpha-10)]"
        }`}
      >
        <div
          className={`bg-background absolute top-1 left-1 h-4 w-4 rounded-full transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}
