import {
  CreditCard,
  Monitor,
  Smartphone,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  XCircle,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import type { CashRegisterStats } from "./useCashRegisterStats";

// ─── Yardımcı ────────────────────────────────────────────────

function formatCurrency(value: number, currency: string): string {
  const map: Record<string, string> = { tl: "TRY", usd: "USD", eur: "EUR" };
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: map[currency] || "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

// ─── Tek Kart ────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorVar: string; // ör: "--color-primary"
  small?: boolean;
}

function StatCard({ label, value, icon: Icon, colorVar, small }: StatCardProps) {
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
          <Icon
            className="h-5 w-5"
            style={{ color: `var(${colorVar})` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Kart Grubu ──────────────────────────────────────────────

interface StatCardsProps {
  stats: CashRegisterStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const generalCards: StatCardProps[] = [
    {
      label: "Toplam Yazarkasa",
      value: stats.total,
      icon: CreditCard,
      colorVar: "--color-primary",
    },
    {
      label: "TSM",
      value: stats.tsm,
      icon: Monitor,
      colorVar: "--color-info",
    },
    {
      label: "GMP",
      value: stats.gmp,
      icon: Smartphone,
      colorVar: "--color-warning",
    },
    {
      label: "Yıllık",
      value: stats.yearly,
      icon: CalendarCheck,
      colorVar: "--color-success",
    },
    {
      label: "Aylık",
      value: stats.monthly,
      icon: CalendarClock,
      colorVar: "--color-info",
    },
    {
      label: "Aktif",
      value: stats.active,
      icon: CheckCircle2,
      colorVar: "--color-success",
    },
    {
      label: "Pasif",
      value: stats.passive,
      icon: XCircle,
      colorVar: "--color-error",
    },
  ];

  const yearlyPriceCards: StatCardProps[] = [
    {
      label: "Yıllık TL",
      value: formatCurrency(stats.yearlyByPrice.tl, "tl"),
      icon: DollarSign,
      colorVar: "--color-primary",
      small: true,
    },
    {
      label: "Yıllık USD",
      value: formatCurrency(stats.yearlyByPrice.usd, "usd"),
      icon: DollarSign,
      colorVar: "--color-success",
      small: true,
    },
    {
      label: "Yıllık EUR",
      value: formatCurrency(stats.yearlyByPrice.eur, "eur"),
      icon: DollarSign,
      colorVar: "--color-warning",
      small: true,
    },
  ];

  const monthlyPriceCards: StatCardProps[] = [
    {
      label: "Aylık TL",
      value: formatCurrency(stats.monthlyByPrice.tl, "tl"),
      icon: DollarSign,
      colorVar: "--color-primary",
      small: true,
    },
    {
      label: "Aylık USD",
      value: formatCurrency(stats.monthlyByPrice.usd, "usd"),
      icon: DollarSign,
      colorVar: "--color-success",
      small: true,
    },
    {
      label: "Aylık EUR",
      value: formatCurrency(stats.monthlyByPrice.eur, "eur"),
      icon: DollarSign,
      colorVar: "--color-warning",
      small: true,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Genel İstatistikler */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {generalCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Yıllık ve Aylık Toplamlar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {yearlyPriceCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
        {monthlyPriceCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
