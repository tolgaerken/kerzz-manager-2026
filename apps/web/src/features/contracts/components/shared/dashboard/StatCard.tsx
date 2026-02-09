import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorVar: string;
  small?: boolean;
}

export function StatCard({ label, value, icon: Icon, colorVar, small }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-hover)]">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
          <p className={`mt-1 font-bold text-[var(--color-foreground)] ${small ? "text-base" : "text-2xl"}`}>
            {value}
          </p>
        </div>
        <div
          className="flex-shrink-0 rounded-full p-3"
          style={{
            backgroundColor: `color-mix(in oklch, var(${colorVar}) 20%, transparent)`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: `var(${colorVar})` }} />
        </div>
      </div>
    </div>
  );
}
