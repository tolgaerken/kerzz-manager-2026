import { CalendarDays, CalendarRange, Calendar } from "lucide-react";
import type { TimePeriodStats } from "./useCashRegisterStats";

// ─── Yardımcı ────────────────────────────────────────────────

function formatCurrency(value: number, currency: string): string {
  const map: Record<string, string> = { tl: "TRY", usd: "USD", eur: "EUR" };
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: map[currency] || "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

const CURRENCY_LABELS: Record<string, string> = {
  tl: "TL",
  usd: "USD",
  eur: "EUR",
};

// ─── Tek Zaman Kartı ─────────────────────────────────────────

interface TimeCardProps {
  title: string;
  icon: typeof CalendarDays;
  colorVar: string;
  stats: TimePeriodStats;
}

function TimeCard({ title, icon: Icon, colorVar, stats }: TimeCardProps) {
  const currencies = (["tl", "usd", "eur"] as const).filter(
    (c) => stats.currencyCounts[c] > 0
  );

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-hover)]">
      {/* Başlık */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="rounded-lg p-2"
          style={{
            backgroundColor: `color-mix(in oklch, var(${colorVar}) 15%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: `var(${colorVar})` }} />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          {title}
        </h3>
      </div>

      {/* Toplam Adet */}
      <p className="text-3xl font-bold text-[var(--color-foreground)]">
        {stats.count}
        <span className="ml-1.5 text-sm font-normal text-[var(--color-muted-foreground)]">
          adet
        </span>
      </p>

      {/* Para birimi detay */}
      {currencies.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3">
          {currencies.map((cur) => (
            <div
              key={cur}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-[var(--color-muted-foreground)]">
                {CURRENCY_LABELS[cur]}{" "}
                <span className="opacity-70">({stats.currencyCounts[cur]} adet)</span>
              </span>
              <span className="font-medium text-[var(--color-foreground)]">
                {formatCurrency(stats.currencyTotals[cur], cur)}
              </span>
            </div>
          ))}
        </div>
      )}

      {stats.count === 0 && (
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Bu dönemde kayıt yok
        </p>
      )}
    </div>
  );
}

// ─── Kart Grubu ──────────────────────────────────────────────

interface TimeBasedCardsProps {
  today: TimePeriodStats;
  thisMonth: TimePeriodStats;
  thisYear: TimePeriodStats;
}

export function TimeBasedCards({ today, thisMonth, thisYear }: TimeBasedCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <TimeCard
        title="Bugün"
        icon={CalendarDays}
        colorVar="--color-success"
        stats={today}
      />
      <TimeCard
        title="Bu Ay"
        icon={CalendarRange}
        colorVar="--color-info"
        stats={thisMonth}
      />
      <TimeCard
        title="Bu Yıl"
        icon={Calendar}
        colorVar="--color-primary"
        stats={thisYear}
      />
    </div>
  );
}
